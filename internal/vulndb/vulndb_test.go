package vulndb

import (
	"testing"
)

func TestParseNVDResponse(t *testing.T) {
	mockJSON := `{
		"vulnerabilities": [
			{
				"cve": {
					"id": "CVE-2023-1234",
					"descriptions": [
						{"lang": "en", "value": "Test vulnerability description"}
					],
					"published": "2023-01-01T00:00:00.000",
					"metrics": {
						"cvssMetricV31": [
							{
								"cvssData": {
									"baseScore": 7.5,
									"baseSeverity": "HIGH"
								}
							}
						]
					},
					"references": [
						{"url": "https://example.com/ref1"}
					]
				}
			},
			{
				"cve": {
					"id": "CVE-2023-5678",
					"descriptions": [
						{"lang": "en", "value": "Low severity vuln"}
					],
					"published": "2023-02-01T00:00:00.000",
					"metrics": {
						"cvssMetricV31": [
							{
								"cvssData": {
									"baseScore": 3.0,
									"baseSeverity": "LOW"
								}
							}
						]
					}
				}
			}
		]
	}`

	t.Run("Filter by CVSS", func(t *testing.T) {
		cves, err := parseNVDResponse([]byte(mockJSON), 5.0)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}

		if len(cves) != 1 {
			t.Errorf("Expected 1 CVE, got %d", len(cves))
		}

		if cves[0].ID != "CVE-2023-1234" {
			t.Errorf("Expected CVE-2023-1234, got %s", cves[0].ID)
		}
	})

	t.Run("Show all CVEs", func(t *testing.T) {
		cves, err := parseNVDResponse([]byte(mockJSON), 0.0)
		if err != nil {
			t.Fatalf("Unexpected error: %v", err)
		}

		if len(cves) != 2 {
			t.Errorf("Expected 2 CVEs, got %d", len(cves))
		}
	})
}

func TestSeverityColor(t *testing.T) {
	// Just ensure it doesn't crash and returns something
	res := SeverityColor("CRITICAL", 9.8)
	if res == "" {
		t.Error("SeverityColor returned empty string")
	}
}
