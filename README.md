# NetChain — ALHacking Network Recon + Vuln Analysis Tool

A terminal pipeline for Kali Linux and Fedora that chains:

```
Host Discovery (nmap) → Port/Service Scan → CVE Lookup (NVD) → Exploit Correlation (ExploitDB)
```

## Install

```bash
sudo bash setup.sh
```

## Usage

```bash
# Basic scan of a subnet
sudo netchian scan -t 192.168.1.0/24

# Aggressive scan, only show HIGH/CRITICAL (CVSS >= 7.0), save JSON
sudo netchian scan -t 10.0.0.1-50 --intensity aggressive --max-cvss 7.0 --save report.json

# Stealth SYN scan, markdown output
sudo netchian scan -t 192.168.0.5 --intensity stealth --output markdown

# Skip exploit lookup (faster)
sudo netchian scan -t 172.16.0.0/24 --no-exploits
```

## Flags

| Flag | Default | Description |
|---|---|---|
| `-t, --target` | (required) | IP, range, or CIDR |
| `--intensity` | `default` | `stealth` / `default` / `aggressive` |
| `--max-cvss` | `0.0` | Only show CVEs ≥ this CVSS score |
| `-o, --output` | `table` | `table` / `json` / `markdown` |
| `--save` | (none) | Path to save report file |
| `--no-exploits` | false | Skip ExploitDB correlation |

## Notes

- Requires root for SYN scan (`stealth`/`aggressive` modes)
- Add an NVD API key in `configs/config.yaml` to increase API rate limits
- Ensure `exploitdb` is installed: `sudo apt install exploitdb`
