package scanner

import (
	"context"
	"fmt"
	"time"

	"github.com/Ullaakut/nmap/v3"
	"github.com/fatih/color"
)

// Host represents a discovered network host with open services.
type Host struct {
	IP        string
	Hostname  string
	OS        string
	Services  []Service
	Hops      int
}

// Service represents an open port with associated metadata.
type Service struct {
	Port     uint16
	Protocol string
	State    string
	Name     string
	Product  string
	Version  string
	CPE      []string
}

// ScanOptions configures the nmap scan behavior.
type ScanOptions struct {
	Target    string
	Intensity string // stealth | default | aggressive
}

// Discover runs host discovery + service version detection on the target range.
func Discover(opts ScanOptions) ([]Host, error) {
	color.Cyan("\n[PHASE 1] Network Discovery & Port Scanning → %s\n", opts.Target)

	nmapOpts := buildNmapOptions(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
	defer cancel()

	scanner, err := nmap.NewScanner(ctx, nmapOpts...)
	if err != nil {
		return nil, fmt.Errorf("nmap scanner init failed: %w", err)
	}

	color.Yellow("  → Running nmap (%s intensity). This may take a while...\n", opts.Intensity)
	result, warnings, err := scanner.Run()
	if err != nil {
		return nil, fmt.Errorf("nmap scan failed: %w", err)
	}
	if len(*warnings) > 0 {
		for _, w := range *warnings {
			color.Yellow("  [nmap warning] %s", w)
		}
	}

	hosts := parseResults(result)
	color.Green("  ✓ Discovered %d live host(s)\n", len(hosts))
	return hosts, nil
}

func buildNmapOptions(opts ScanOptions) []nmap.Option {
	base := []nmap.Option{
		nmap.WithTargets(opts.Target),
		nmap.WithServiceInfo(),     // -sV: version detection
		nmap.WithOSDetection(),     // -O:  OS fingerprinting
		nmap.WithScripts("vulners"), // --script vulners: built-in CVE mapping
		nmap.WithVersionIntensity(5),
	}

	switch opts.Intensity {
	case "stealth":
		// SYN stealth scan, slow timing (requires root)
		base = append(base,
			nmap.WithSYNScan(),
			nmap.WithTimingTemplate(nmap.TimingSneaky),
		)
	case "aggressive":
		// Aggressive: OS detect, version detect, script scan, traceroute
		base = append(base,
			nmap.WithAggressiveScan(),
			nmap.WithTimingTemplate(nmap.TimingAggressive),
		)
	default:
		// Balanced default
		base = append(base,
			nmap.WithConnectScan(),
			nmap.WithTimingTemplate(nmap.TimingNormal),
		)
	}

	return base
}

func parseResults(result *nmap.Run) []Host {
	var hosts []Host

	for _, h := range result.Hosts {
		if len(h.Ports) == 0 {
			continue
		}

		host := Host{
			Hops: h.Distance.Value,
		}

		// IP address
		for _, addr := range h.Addresses {
			if addr.AddrType == "ipv4" || addr.AddrType == "ipv6" {
				host.IP = addr.Addr
			}
		}

		// Hostname
		if len(h.Hostnames) > 0 {
			host.Hostname = h.Hostnames[0].Name
		}

		// OS
		if len(h.OS.Matches) > 0 {
			host.OS = h.OS.Matches[0].Name
		}

		// Services
		for _, p := range h.Ports {
			if p.State.State != "open" {
				continue
			}
			svc := Service{
				Port:     p.ID,
				Protocol: string(p.Protocol),
				State:    p.State.State,
				Name:     p.Service.Name,
				Product:  p.Service.Product,
				Version:  p.Service.Version,
			}
			for _, c := range p.Service.CPEs {
				svc.CPE = append(svc.CPE, string(c))
			}
			host.Services = append(host.Services, svc)
		}

		hosts = append(hosts, host)
	}
	return hosts
}
