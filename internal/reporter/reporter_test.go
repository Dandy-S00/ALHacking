package reporter

import (
	"testing"
	"time"

	"github.com/Dandy-S00/ALHacking/internal/exploits"
	"github.com/Dandy-S00/ALHacking/internal/scanner"
	"github.com/Dandy-S00/ALHacking/internal/vulndb"
)

func TestRunChainCaching(t *testing.T) {
	// Mock configuration
	cfg := ScanConfig{
		Target: "127.0.0.1",
	}

	// Mock data: 2 hosts with the same service
	mockHosts := []scanner.Host{
		{
			IP: "192.168.1.1",
			Services: []scanner.Service{
				{Port: 80, Protocol: "tcp", Product: "Apache", Version: "2.4.49", CPE: []string{"cpe:/a:apache:http_server:2.4.49"}},
			},
		},
		{
			IP: "192.168.1.2",
			Services: []scanner.Service{
				{Port: 80, Protocol: "tcp", Product: "Apache", Version: "2.4.49", CPE: []string{"cpe:/a:apache:http_server:2.4.49"}},
			},
		},
	}

	// Tracking counters
	cpeLookupCount := 0
	keywordLookupCount := 0
	exploitSearchCount := 0
	sleepCount := 0

	// Mock functions
	discover := func(opts scanner.ScanOptions) ([]scanner.Host, error) {
		return mockHosts, nil
	}
	lookupCPE := func(cpe string, minCVSS float64, key string) ([]vulndb.CVE, error) {
		cpeLookupCount++
		return []vulndb.CVE{{ID: "CVE-2021-41773"}}, nil
	}
	lookupKeyword := func(prod, ver string, minCVSS float64, key string) ([]vulndb.CVE, error) {
		keywordLookupCount++
		return nil, nil
	}
	searchExploits := func(prod, ver string) ([]exploits.Exploit, error) {
		exploitSearchCount++
		return []exploits.Exploit{{EDB_ID: "50383"}}, nil
	}
	sleep := func(d time.Duration) {
		sleepCount++
	}

	// Execute internal RunChain
	err := runChainInternal(cfg, discover, lookupCPE, lookupKeyword, searchExploits, sleep)
	if err != nil {
		t.Fatalf("runChainInternal failed: %v", err)
	}

	// Assertions
	if cpeLookupCount != 1 {
		t.Errorf("Expected 1 CPE lookup, got %d", cpeLookupCount)
	}
	if exploitSearchCount != 1 {
		t.Errorf("Expected 1 exploit search, got %d", exploitSearchCount)
	}
	if sleepCount != 1 {
		t.Errorf("Expected 1 sleep call, got %d", sleepCount)
	}
}
