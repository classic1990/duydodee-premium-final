import os
import re

# patterns for secrets
PATTERNS = {
    "Firebase API Key": r"AIza[0-9A-Za-z-_]{35}",
    "Google OAuth Client ID": r"[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com",
    "Generic API Key": r"api[_-]?key[:=]\s*['\"][0-9a-zA-Z]{32,45}['\"]",
    "Firebase App ID": r"1:[0-9]+:web:[0-9a-f]{24}"
}

def scan_file(file_path):
    findings = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            for name, pattern in PATTERNS.items():
                matches = re.finditer(pattern, content)
                for match in matches:
                    findings.append({
                        "type": name,
                        "line": content.count('\n', 0, match.start()) + 1,
                        "value": match.group()
                    })
    except Exception as e:
        pass
    return findings

def main():
    print("--- DUYDODEE Security Scan ---")
    base_dir = "."
    exclude_dirs = [".git", "node_modules", "dist", ".skills"]
    
    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith(('.js', '.html', '.env', '.json')):
                path = os.path.join(root, file)
                findings = scan_file(path)
                if findings:
                    print(f"\n[!] Found potential secrets in: {path}")
                    for f in findings:
                        # Mask secret
                        val = f['value']
                        masked = val[:6] + "..." + val[-4:]
                        print(f"    - {f['type']} at line {f['line']}: {masked}")

if __name__ == "__main__":
    main()
