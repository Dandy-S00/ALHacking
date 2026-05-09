package main

import (
	"fmt"
	"os"

	"github.com/Dandy-S00/ALHacking/internal/reporter"
	"github.com/fatih/color"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var (
	targetRange  string
	outputFormat string
	intensity    string
	maxCVSS      float64
	savePath     string
	skipExploits bool
)

func main() {
	root := &cobra.Command{
		Use:   "netchian",
		Short: "Network discovery → vuln analysis → exploit chain",
		Long: color.CyanString(`
 ███╗   ██╗███████╗████████╗ ██████╗██╗  ██╗ █████╗ ██╗███╗   ██╗
 ████╗  ██║██╔════╝╚══██╔══╝██╔════╝██║  ██║██╔══██╗██║████╗  ██║
 ██╔██╗ ██║█████╗     ██║   ██║     ███████║███████║██║██╔██╗ ██║
 ██║╚██╗██║██╔══╝     ██║   ██║     ██╔══██║██╔══██║██║██║╚██╗██║
 ██║ ╚████║███████╗   ██║   ╚██████╗██║  ██║██║  ██║██║██║ ╚████║
 ╚═╝  ╚═══╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 ALHacking | Network Recon + Vuln Chain | Kali Linux
`) + `
Chain: Discovery → Port Scan → CVE Lookup → ExploitDB Correlation

Examples:
  sudo netchian scan -t 192.168.1.0/24
  sudo netchian scan -t 10.0.0.1-50 --intensity aggressive --output json
  sudo netchian scan -t 192.168.0.5 --max-cvss 7.0 --save report.json
`,
	}

	scanCmd := &cobra.Command{
		Use:   "scan",
		Short: "Run full recon + vuln chain on a target range",
		RunE:  runScan,
	}

	scanCmd.Flags().StringVarP(&targetRange, "target", "t", "", "Target IP, range, or CIDR (required)")
	scanCmd.Flags().StringVarP(&outputFormat, "output", "o", "table", "Output format: table | json | markdown")
	scanCmd.Flags().StringVar(&intensity, "intensity", "default", "Scan intensity: stealth | default | aggressive")
	scanCmd.Flags().Float64Var(&maxCVSS, "max-cvss", 0.0, "Filter CVEs: only show CVSS >= this value (0 = show all)")
	scanCmd.Flags().StringVar(&savePath, "save", "", "Save report to file path")
	scanCmd.Flags().BoolVar(&skipExploits, "no-exploits", false, "Skip ExploitDB correlation step")
	_ = scanCmd.MarkFlagRequired("target")

	root.AddCommand(scanCmd)
	root.AddCommand(versionCmd())

	if err := root.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func runScan(cmd *cobra.Command, args []string) error {
	// Initialize viper to read config
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./configs")
	viper.AddConfigPath("/etc/netchian")

	nvdKey := ""
	if err := viper.ReadInConfig(); err == nil {
		nvdKey = viper.GetString("nvd_api_key")
	}

	cfg := reporter.ScanConfig{
		Target:       targetRange,
		OutputFormat: outputFormat,
		Intensity:    intensity,
		MinCVSS:      maxCVSS,
		SavePath:     savePath,
		SkipExploits: skipExploits,
		NVDKey:       nvdKey,
	}
	return reporter.RunChain(cfg)
}

func versionCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print version information",
		Run: func(cmd *cobra.Command, args []string) {
			color.Cyan("netchian v1.0.0 — ALHacking | github.com/Dandy-S00/ALHacking")
		},
	}
}
