#!/usr/bin/env python3
"""
MCP Server Information Extractor - Hybrid Approach (urllib version)

This script extracts MCP server names, links, and descriptions from the
modelcontextprotocol/servers GitHub repository using multiple fallback methods.
Uses only Python standard library (urllib instead of requests).
"""

import re
import json
import traceback
import urllib.request
import urllib.error
import urllib.parse
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
import time
import base64

@dataclass
class MCPServer:
    name: str
    link: str
    description: str
    section: str  # reference, archived, third-party, community

class MCPServerExtractor:
    def __init__(self):
        self.base_url = "https://github.com/modelcontextprotocol/servers"
        self.raw_url = "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md"
        self.api_url = "https://api.github.com/repos/modelcontextprotocol/servers"
        self.headers = {
            'User-Agent': 'MCP-Server-Extractor/1.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }

    def _make_request(self, url: str, timeout: int = 30) -> str:
        """Make HTTP request using urllib"""
        req = urllib.request.Request(url, headers=self.headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.read().decode('utf-8')
        except urllib.error.HTTPError as e:
            raise Exception(f"HTTP {e.code}: {e.reason}")
        except urllib.error.URLError as e:
            raise Exception(f"URL Error: {e.reason}")

    def extract_servers(self) -> List[MCPServer]:
        """Main extraction method using hybrid approach"""
        servers = []

        # Method 1: Direct README parsing
        try:
            print("Attempting Method 1: Direct README parsing...")
            servers = self._parse_readme_direct()
            if servers:
                print(f"✓ Method 1 succeeded: Found {len(servers)} servers")
                return servers
        except Exception as e:
            traceback.print_exc()
            print(f"✗ Method 1 failed: {e}")

    def _parse_readme_direct(self) -> List[MCPServer]:
        """Method 1: Direct README.md parsing"""
        content = self._make_request(self.raw_url)
        return self._parse_markdown_content(content)

    def _parse_via_github_api(self) -> List[MCPServer]:
        """Method 2: GitHub API approach"""
        readme_url = f"{self.api_url}/readme"
        content = self._make_request(readme_url)

        readme_data = json.loads(content)
        decoded_content = base64.b64decode(readme_data['content']).decode('utf-8')
        return self._parse_markdown_content(decoded_content)

    def _parse_via_web_scraping(self) -> List[MCPServer]:
        """Method 3: Web scraping the GitHub page"""
        content = self._make_request(self.base_url)

        # Extract README content from GitHub's rendered page
        readme_match = re.search(r'<article[^>]*class="[^"]*markdown-body[^"]*"[^>]*>(.*?)</article>', content, re.DOTALL)
        if readme_match:
            html_content = readme_match.group(1)
            # Convert HTML to markdown-like text for parsing
            markdown_content = self._html_to_markdown(html_content)
            return self._parse_markdown_content(markdown_content)

        return []

    def _parse_alternative_endpoints(self) -> List[MCPServer]:
        """Method 4: Try alternative endpoints"""
        alternative_urls = [
            "https://raw.githubusercontent.com/modelcontextprotocol/servers/master/README.md",
            "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/readme.md",
        ]

        for url in alternative_urls:
            try:
                content = self._make_request(url)
                return self._parse_markdown_content(content)
            except Exception:
                continue

        return []

    def _parse_markdown_content(self, content: str) -> List[MCPServer]:
        """Parse markdown content to extract server information"""
        servers = []
        sections = self._split_into_sections(content)

        for section_name, section_content in sections.items():
            section_servers = self._extract_servers_from_section(section_content, section_name)
            servers.extend(section_servers)

        return servers

    def _split_into_sections(self, content: str) -> Dict[str, str]:
        """Split content into the four main sections"""
        sections = {}

        # Define section patterns
        section_patterns = {
            'reference': r'##.* Reference\s*Servers\n(.*?)(?=## |### |$)',
            'archived': r'##.*Archived\n(.*?)(?=## |### |$)',
            'third-party': r'##.*Third[-]?Party\s*Servers\n.* Official Integrations(.*?)(?=## |### |$)',
            'community': r'##.*Community\s*Servers\n(.*?)(?=## |### |$)'
        }

        content_of_interest_pattern = r'(- \*\*.*)'

        for section_name, pattern in section_patterns.items():
            match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
            if match:
                group_match = match.group(1).strip()
                cleanup_match = re.search(content_of_interest_pattern, group_match, re.DOTALL)
                if cleanup_match:
                    cleanup_string = cleanup_match.group(1).strip()
                    sections[section_name] = cleanup_string
                else:
                    print(group_match)


        return sections

    def _extract_servers_from_section(self, content: str, section: str) -> List[MCPServer]:
        """Extract server information from a section"""
        servers = []

        # Pattern 1: [Name](link) - Description
        # pattern1 = r'-\s*\[([^\]]+)\]\(([^)]+)\)\s*[-–—]\s*(.+?)(?=\n|$)'
        pattern1 = r'-\s*\*\*\[([^\]]+)\]\(([^)]*)\)\*\*\s*[-–— ]\s*(.*?)(?=\n|$)'
        matches = re.findall(pattern1, content, re.MULTILINE)
        for name, link, desc in matches:
            servers.append(MCPServer(
                name=name.strip(),
                link=self._normalize_link(link.strip()),
                description=desc.strip(),
                section=section
            ))

        # Pattern 2: - **Name** - [link](url) - Description
        pattern2 = r'-\s*<img[^>]*>\s*\*\*\[([^\]]+)\]\(([^)]*)\)\*\*\s*[-–— ]\s*(.*?)(?=\n|$)'
        # pattern2 = r'-\s*\*\*([^*]+)\*\*\s*[-–—]\s*\[([^\]]*)\]\(([^)]+)\)\s*[-–—]\s*(.+?)(?=\n|$)'
        matches = re.findall(pattern2, content, re.MULTILINE)
        for name, link, desc in matches:
            servers.append(MCPServer(
                name=name.strip(),
                link=self._normalize_link(link.strip()),
                description=desc.strip(),
                section=section
            ))

        return servers

    def _normalize_link(self, link: str) -> str:
        """Normalize and validate links"""
        link = link.strip()
        if not link.startswith(('http://', 'https://')):
            if link.startswith('/'):
                link = 'https://github.com' + link
            elif not link.startswith('www.'):
                link = 'https://' + link
        return link

    def _html_to_markdown(self, html: str) -> str:
        """Convert HTML to markdown-like text for parsing"""
        # Remove HTML tags but preserve structure
        html = re.sub(r'<[^>]+>', ' ', html)
        # Decode HTML entities
        html = html.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
        html = html.replace('&#39;', "'").replace('&quot;', '"')
        return html

    def save_results(self, servers: List[MCPServer], filename: str = 'mcp_servers.json'):
        """Save results to JSON file"""
        data = {
            'extraction_timestamp': time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime()),
            'total_servers': len(servers),
            'servers_by_section': {
                section: len([s for s in servers if s.section == section])
                for section in ['reference', 'archived', 'third-party', 'community']
            },
            'servers': [asdict(server) for server in servers]
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"Results saved to {filename}")
        return filename

def main():
    """Main execution function"""
    extractor = MCPServerExtractor()

    print("Starting MCP Server extraction using hybrid approach...")
    print("=" * 60)

    servers = extractor.extract_servers()

    if servers:
        print(f"\n🎉 Successfully extracted {len(servers)} MCP servers!")

        # Display summary
        sections = {}
        for server in servers:
            if server.section not in sections:
                sections[server.section] = []
            sections[server.section].append(server)

        print("\nSummary by section:")
        for section, section_servers in sections.items():
            print(f"  {section.title()}: {len(section_servers)} servers")

        # Save results
        filename = extractor.save_results(servers)

        # Display first few servers as sample
        print(f"\nSample servers (first 5):")
        for i, server in enumerate(servers[:5]):
            print(f"  {i+1}. {server.name}")
            print(f"     Link: {server.link}")
            print(f"     Section: {server.section}")
            print(f"     Description: {server.description[:80]}...")
            print()

        return servers
    else:
        print("❌ Failed to extract any servers")
        return []

if __name__ == "__main__":
    main()