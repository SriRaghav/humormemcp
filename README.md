# MCP Server Extractor - Hybrid Approach

A robust Python script that extracts MCP (Model Context Protocol) server information from the [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) GitHub repository using multiple fallback methods.

## Features

### Hybrid Extraction Strategy
The extractor uses 4 different methods in sequence until one succeeds:

1. **Direct README Parsing** - Fetches raw README.md from GitHub
2. **GitHub API** - Uses GitHub's REST API to get README content
3. **Web Scraping** - Parses the rendered GitHub page
4. **Alternative Endpoints** - Tries different URL variations

### Data Extraction
Extracts from all 4 main sections:
- **Reference Servers** - Official MCP reference implementations
- **Archived Servers** - Deprecated/legacy servers
- **Third-party Servers** - Community-maintained servers
- **Community Servers** - User-contributed servers

### Multiple Pattern Recognition
Handles various README formats:
- `- [Name](link) - Description`
- `- **Name** - [link](url) - Description`
- Table formats with `| Name | Link | Description |`
- Simple bullet points with embedded links

## Usage

### Basic Usage
```bash
python3 mcp_server_extractor_urllib.py
```

### Output
- Console output with extraction progress
- JSON file (`mcp_servers.json`) with structured data
- Summary statistics by section

## Output Format

```json
{
  "extraction_timestamp": "2024-01-15 12:30:45 UTC",
  "total_servers": 42,
  "servers_by_section": {
    "reference": 5,
    "archived": 3,
    "third-party": 18,
    "community": 16
  },
  "servers": [
    {
      "name": "Server Name",
      "link": "https://github.com/example/server",
      "description": "Brief description of what the server does",
      "section": "reference"
    }
  ]
}
```

## Network Requirements

The script requires internet access to:
- `raw.githubusercontent.com` (primary)
- `api.github.com` (fallback)
- `github.com` (fallback)

## Error Handling

- Graceful fallback between methods
- Detailed error reporting for each method
- Continues trying alternative approaches on failure
- Network timeout handling (30 seconds)

## Dependencies

Uses only Python standard library:
- `urllib.request` for HTTP requests
- `json` for data serialization
- `re` for pattern matching
- `dataclasses` for structured data

## Customization

### Adding New Patterns
To handle additional README formats, add patterns to `_extract_servers_from_section()`:

```python
# New pattern for different format
pattern_new = r'your_regex_pattern_here'
matches = re.findall(pattern_new, content, re.MULTILINE)
```

### Modifying Sections
Update `section_patterns` in `_split_into_sections()` to handle different section names:

```python
section_patterns = {
    'new_section': r'##\s*New\s*Section\s*Name(.*?)(?=##|$)',
}
```

## Troubleshooting

### Common Issues
1. **403 Forbidden** - Network restrictions or rate limiting
2. **Connection Timeout** - Slow network or server issues
3. **Empty Results** - README format changes or parsing issues

### Debug Mode
Add debug prints to see which patterns are matching:

```python
print(f"Pattern 1 matches: {len(matches)}")
for match in matches:
    print(f"  Found: {match}")
```# humormemcp
