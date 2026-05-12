package reporter

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/Dandy-S00/ALHacking/internal/exploits"
	"github.com/Dandy-S00/ALHacking/internal/scanner"
	"github.com/Dandy-S00/ALHacking/internal/vulndb"
	"github.com/fatih/color"
	"github.com/rodaine/table"
)

// ScanConfig holds top-level scan configuration passed from CLI.
type ScanConfig struct {
	Target       string
	OutputFormat string
	Intensity    string
	MinCVSS      float64
	SavePath     string
	SkipExploits bool
	NVDKey       string
}

// HostReport is the fully assembled result for one host.
type HostReport struct {
	Host     scanner.Host
	VulnMap  map[string]ServiceVulns // keyed by "port/protocol"
}

// ServiceVulns associates CVEs and exploits with a specific service.
type ServiceVulns struct {
	Service  scanner.Service
	CVEs     []vulndb.CVE
	Exploits []exploits.Exploit
}

// ChainReport is the top-level output of a full scan run.
type ChainReport struct {
	Target    string
	StartedAt string
	Hosts     []HostReport
}

// RunChain executes the full discovery → CVE → exploit chain.
func RunChain(cfg ScanConfig) error {
	printBanner(cfg)
	startTime := time.Now()

	// ── Phase 1: Network Discovery ──────────────────────────────────────────
	hosts, err := scanner.Discover(scanner.ScanOptions{
		Target:    cfg.Target,
		Intensity: cfg.Intensity,
	})
	if err != nil {
		return fmt.Errorf("scan error: %w", err)
	}

	if len(hosts) == 0 {
		color.Yellow("\nNo live hosts found on %s\n", cfg.Target)
		return nil
	}

	// ── Phase 2 & 3: CVE Lookup + Exploit Correlation ──────────────────────
	color.Cyan("\n[PHASE 2] CVE Vulnerability Lookup (NVD API)\n")

	report := ChainReport{
		Target:    cfg.Target,
		StartedAt: startTime.Format(time.RFC3339),
	}

	for _, host := range hosts {
		hr := HostReport{
			Host:    host,
			VulnMap: make(map[string]ServiceVulns),
		}

		for _, svc := range host.Services {
			key := fmt.Sprintf("%d/%s", svc.Port, svc.Protocol)
			sv := ServiceVulns{Service: svc}

			if svc.Product == "" {
				continue
			}

			color.White("  → %s [%s %s]...", key, svc.Product, svc.Version)

			// CVE lookup: try CPE first, fallback to keyword
			var cves []vulndb.CVE
			for _, cpe := range svc.CPE {
				cves, err = vulndb.LookupByCPE(cpe, cfg.MinCVSS, cfg.NVDKey)
				if err == nil && len(cves) > 0 {
					break
				}
			}
			if len(cves) == 0 {
				cves, _ = vulndb.LookupByKeyword(svc.Product, svc.Version, cfg.MinCVSS, cfg.NVDKey)
			}
			sv.CVEs = cves

			// Phase 3: Exploit correlation
			if !cfg.SkipExploits && (svc.Product != "") {
				sv.Exploits, _ = exploits.SearchByProduct(svc.Product, svc.Version)
			}

			vulnCount := len(sv.CVEs)
			exploitCount := len(sv.Exploits)
			if vulnCount > 0 || exploitCount > 0 {
				color.Red(" %d CVE(s) | %d exploit(s)\n", vulnCount, exploitCount)
			} else {
				color.Green(" clean\n")
			}

			hr.VulnMap[key] = sv
		}

		report.Hosts = append(report.Hosts, hr)
	}

	// ── Output ────────────────────────────────────────────────────────────
	switch strings.ToLower(cfg.OutputFormat) {
	case "json":
		printJSON(report, cfg.SavePath)
	case "markdown", "md":
		printMarkdown(report, cfg.SavePath)
	default:
		printTable(report)
		if cfg.SavePath != "" {
			printJSON(report, cfg.SavePath)
		}
	}

	color.Cyan("\nCompleted in %s\n", time.Since(startTime).Round(time.Second))
	return nil
}

// ─── Table Output ─────────────────────────────────────────────────────────────

func printTable(report ChainReport) {
	color.Cyan("\n[PHASE 3] Exploit Chain Report\n")
	color.Cyan("Target: %s | Hosts: %d\n\n", report.Target, len(report.Hosts))

	for _, hr := range report.Hosts {
		h := hr.Host
		label := h.IP
		if h.Hostname != "" {
			label = fmt.Sprintf("%s (%s)", h.IP, h.Hostname)
		}
		color.New(color.FgCyan, color.Bold).Printf("┌─ HOST: %s", label)
		if h.OS != "" {
			color.CyanString(" | OS: %s", h.OS)
			fmt.Printf("  OS: %s", h.OS)
		}
		fmt.Println()

		for _, sv := range hr.VulnMap {
			svc := sv.Service
			svcLabel := fmt.Sprintf("  %d/%s  %s %s", svc.Port, svc.Protocol, svc.Product, svc.Version)
			color.New(color.FgWhite, color.Bold).Println(svcLabel)

			if len(sv.CVEs) > 0 {
				tbl := table.New("  CVE ID", "CVSS", "Published", "Description")
				tbl.WithHeaderFormatter(color.New(color.FgYellow, color.Underline).SprintfFunc())
				tbl.WithFirstColumnFormatter(color.New(color.FgCyan).SprintfFunc())

				for _, cve := range sv.CVEs {
					desc := cve.Description
					if len(desc) > 80 {
						desc = desc[:77] + "..."
					}
					tbl.AddRow(
						cve.ID,
						vulndb.SeverityColor(cve.Severity, cve.CVSS),
						cve.Published,
						desc,
					)
				}
				tbl.Print()
			}

			if len(sv.Exploits) > 0 {
				fmt.Println()
				tbl := table.New("  EDB-ID", "Type", "Platform", "Title")
				tbl.WithHeaderFormatter(color.New(color.FgRed, color.Underline).SprintfFunc())

				for _, ex := range sv.Exploits {
					tbl.AddRow(
						color.CyanString(ex.EDB_ID),
						exploits.TypeColor(ex.Type),
						ex.Platform,
						ex.Title,
					)
				}
				tbl.Print()
			}
			fmt.Println()
		}
	}
}

// ─── JSON Output ──────────────────────────────────────────────────────────────

func printJSON(report ChainReport, savePath string) {
	data, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		color.Red("JSON marshal error: %v", err)
		return
	}

	if savePath != "" {
		if err := os.WriteFile(savePath, data, 0644); err != nil {
			color.Red("Failed to write report to %s: %v", savePath, err)
		} else {
			color.Green("\n✓ Report saved to: %s\n", savePath)
		}
	} else {
		fmt.Println(string(data))
	}
}

// ─── Markdown Output ──────────────────────────────────────────────────────────

func printMarkdown(report ChainReport, savePath string) {
	var sb strings.Builder

	sb.WriteString("# NetChain Vulnerability Report\n\n")
	sb.WriteString(fmt.Sprintf("**Target:** `%s`  \n", report.Target))
	sb.WriteString(fmt.Sprintf("**Scan Started:** %s  \n", report.StartedAt))
	sb.WriteString(fmt.Sprintf("**Hosts Found:** %d\n\n", len(report.Hosts)))

	for _, hr := range report.Hosts {
		h := hr.Host
		sb.WriteString(fmt.Sprintf("## Host: `%s`", h.IP))
		if h.Hostname != "" {
			sb.WriteString(fmt.Sprintf(" (%s)", h.Hostname))
		}
		if h.OS != "" {
			sb.WriteString(fmt.Sprintf("\n**OS:** %s\n", h.OS))
		}
		sb.WriteString("\n")

		for _, sv := range hr.VulnMap {
			svc := sv.Service
			sb.WriteString(fmt.Sprintf("### Port %d/%s — %s %s\n\n", svc.Port, svc.Protocol, svc.Product, svc.Version))

			if len(sv.CVEs) > 0 {
				sb.WriteString("#### CVEs\n\n")
				sb.WriteString("| CVE ID | CVSS | Severity | Published | Description |\n")
				sb.WriteString("|--------|------|----------|-----------|-------------|\n")
				for _, cve := range sv.CVEs {
					desc := cve.Description
					if len(desc) > 100 {
						desc = desc[:97] + "..."
					}
					sb.WriteString(fmt.Sprintf("| %s | %.1f | %s | %s | %s |\n",
						cve.ID, cve.CVSS, cve.Severity, cve.Published, desc))
				}
				sb.WriteString("\n")
			}

			if len(sv.Exploits) > 0 {
				sb.WriteString("#### Exploits (ExploitDB)\n\n")
				sb.WriteString("| EDB-ID | Type | Platform | Title |\n")
				sb.WriteString("|--------|------|----------|-------|\n")
				for _, ex := range sv.Exploits {
					sb.WriteString(fmt.Sprintf("| [%s](%s) | %s | %s | %s |\n",
						ex.EDB_ID, exploits.ExploitDBURL(ex.EDB_ID), ex.Type, ex.Platform, ex.Title))
				}
				sb.WriteString("\n")
			}
		}
	}

	content := sb.String()
	if savePath != "" {
		if err := os.WriteFile(savePath, []byte(content), 0644); err != nil {
			color.Red("Failed to write markdown: %v", err)
		} else {
			color.Green("\n✓ Markdown report saved to: %s\n", savePath)
		}
	} else {
		fmt.Print(content)
	}
}

func printBanner(cfg ScanConfig) {
	color.Cyan("\n══════════════════════════════════════════════════════")
	color.Cyan("  NETCHIAN — Network Recon + Vuln Chain")
	color.Cyan("  Target : %s", cfg.Target)
	color.Cyan("  Mode   : %s", cfg.Intensity)
	color.Cyan("  MinCVSS: %.1f  |  ExploitDB: %v", cfg.MinCVSS, !cfg.SkipExploits)
	color.Cyan("══════════════════════════════════════════════════════\n")
}
