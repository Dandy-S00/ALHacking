package reporter

import (
	"testing"
	"time"

	"github.com/Dandy-S00/ALHacking/internal/exploits"
	"github.com/Dandy-S00/ALHacking/internal/scanner"
	"github.com/Dandy-S00/ALHacking/internal/vulndb"
)

func TestPrintSummary(t *testing.T) {
	report := ChainReport{
		Target: "127.0.0.1",
		Hosts: []HostReport{
			{
				Host: scanner.Host{IP: "127.0.0.1"},
				VulnMap: map[string]ServiceVulns{
					"80/tcp": {
						CVEs: []vulndb.CVE{
							{ID: "CVE-2021-1234"},
							{ID: "CVE-2021-5678"},
						},
						Exploits: []exploits.Exploit{
							{EDB_ID: "123"},
						},
					},
					"443/tcp": {
						CVEs: []vulndb.CVE{
							{ID: "CVE-2021-1234"}, // Duplicate ID
						},
						Exploits: []exploits.Exploit{
							{EDB_ID: "456"},
						},
					},
				},
			},
		},
	}

	// This just tests that it doesn't panic and we can see the output if we run with -v
	printSummary(report, 5*time.Second)
}
