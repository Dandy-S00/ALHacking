package vulndb

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/fatih/color"
)

const (
	nvdBaseURL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
	userAgent  = "netchian/1.0 (ALHacking security research)"
)

// CVE holds structured vulnerability data from NVD.
type CVE struct {
	ID          string
	Description string
	CVSS        float64
	Severity    string
	Published   string
	References  []string
}

// LookupByCPE queries NVD for CVEs matching a CPE string.
func LookupByCPE(cpe string, minCVSS float64, apiKey string) ([]CVE, error) {
	params := url.Values{}
	params.Set("cpeName", cpe)
	params.Set("resultsPerPage", "20")

	return queryNVD(params, minCVSS, apiKey)
}

// LookupByKeyword queries NVD for CVEs matching a product keyword.
func LookupByKeyword(product, version string, minCVSS float64, apiKey string) ([]CVE, error) {
	keyword := product
	if version != "" {
		keyword = product + " " + version
	}
	params := url.Values{}
	params.Set("keywordSearch", keyword)
	params.Set("resultsPerPage", "15")

	return queryNVD(params, minCVSS, apiKey)
}

func queryNVD(params url.Values, minCVSS float64, apiKey string) ([]CVE, error) {
	reqURL := fmt.Sprintf("%s?%s", nvdBaseURL, params.Encode())

	client := &http.Client{Timeout: 15 * time.Second}
	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", userAgent)
	if apiKey != "" {
		req.Header.Set("apiKey", apiKey)
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("NVD API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 403 {
		return nil, fmt.Errorf("NVD API rate limited (403). Add an NVD API key in configs/config.yaml")
	}
	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("NVD API returned HTTP %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return parseNVDResponse(body, minCVSS)
}

type nvdResponse struct {
	Vulnerabilities []struct {
		CVE struct {
			ID          string `json:"id"`
			Descriptions []struct {
				Lang  string `json:"lang"`
				Value string `json:"value"`
			} `json:"descriptions"`
			Published string `json:"published"`
			Metrics   struct {
				CVSSMetricV31 []struct {
					CVSSData struct {
						BaseScore    float64 `json:"baseScore"`
						BaseSeverity string  `json:"baseSeverity"`
					} `json:"cvssData"`
				} `json:"cvssMetricV31"`
				CVSSMetricV2 []struct {
					CVSSData struct {
						BaseScore float64 `json:"baseScore"`
					} `json:"cvssData"`
					BaseSeverity string `json:"baseSeverity"`
				} `json:"cvssMetricV2"`
			} `json:"metrics"`
			References []struct {
				URL string `json:"url"`
			} `json:"references"`
		} `json:"cve"`
	} `json:"vulnerabilities"`
}

func parseNVDResponse(body []byte, minCVSS float64) ([]CVE, error) {
	var nvd nvdResponse
	if err := json.Unmarshal(body, &nvd); err != nil {
		return nil, fmt.Errorf("NVD response parse error: %w", err)
	}

	var cves []CVE
	for _, v := range nvd.Vulnerabilities {
		c := CVE{
			ID:        v.CVE.ID,
			Published: strings.SplitN(v.CVE.Published, "T", 2)[0],
		}

		// Description (English preferred)
		for _, d := range v.CVE.Descriptions {
			if d.Lang == "en" {
				c.Description = d.Value
				break
			}
		}

		// CVSS score (v3.1 preferred, fallback v2)
		if len(v.CVE.Metrics.CVSSMetricV31) > 0 {
			c.CVSS = v.CVE.Metrics.CVSSMetricV31[0].CVSSData.BaseScore
			c.Severity = v.CVE.Metrics.CVSSMetricV31[0].CVSSData.BaseSeverity
		} else if len(v.CVE.Metrics.CVSSMetricV2) > 0 {
			c.CVSS = v.CVE.Metrics.CVSSMetricV2[0].CVSSData.BaseScore
			c.Severity = v.CVE.Metrics.CVSSMetricV2[0].BaseSeverity
		}

		// References
		for _, r := range v.CVE.References {
			c.References = append(c.References, r.URL)
		}

		if c.CVSS >= minCVSS {
			cves = append(cves, c)
		}
	}
	return cves, nil
}

// SeverityColor returns a colored severity label for terminal output.
func SeverityColor(severity string, cvss float64) string {
	switch strings.ToUpper(severity) {
	case "CRITICAL":
		return color.New(color.FgRed, color.Bold).Sprintf("CRITICAL (%.1f)", cvss)
	case "HIGH":
		return color.RedString("HIGH (%.1f)", cvss)
	case "MEDIUM":
		return color.YellowString("MEDIUM (%.1f)", cvss)
	case "LOW":
		return color.GreenString("LOW (%.1f)", cvss)
	default:
		if cvss >= 9.0 {
			return color.New(color.FgRed, color.Bold).Sprintf("CRITICAL (%.1f)", cvss)
		} else if cvss >= 7.0 {
			return color.RedString("HIGH (%.1f)", cvss)
		} else if cvss >= 4.0 {
			return color.YellowString("MEDIUM (%.1f)", cvss)
		}
		return color.GreenString("INFO (%.1f)", cvss)
	}
}
