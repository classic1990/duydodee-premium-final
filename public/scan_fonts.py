import os

# รายชื่อฟอนต์ที่ระบบต้องการให้ทำ Preload ทั้งหมดเพื่อประสิทธิภาพสูงสุด
REQUIRED_FONTS = [
    "PlusJakartaSans-Bold.woff2",
    "PlusJakartaSans-ExtraBold.woff2",
    "IBMPlexSansThai-Light.woff2",
    "IBMPlexSansThai-Regular.woff2",
    "IBMPlexSansThai-SemiBold.woff2",
    "Kanit-Black.woff2"
]

def scan_html_assets(base_path):
    """
    สแกนไฟล์ HTML ทั้งหมดเพื่อตรวจสอบการเรียกใช้งาน fonts.css และการทำ Preload ฟอนต์
    """
    public_dir = os.path.join(base_path, 'public')
    results = []
    count = 0

    print(f"🔍 เริ่มต้นการสแกน Cinematic Assets ใน: {public_dir}\n")

    for root, dirs, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                # ข้ามไฟล์ยืนยันสิทธิ์ของ Google
                if file == 'google5b9a52936674cf70.html':
                    continue

                count += 1
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, base_path)
                
                issues = {"missing_css": False, "missing_preloads": []}
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        lines = content.splitlines()
                        
                        # 1. ตรวจสอบการเชื่อมต่อ fonts.css
                        if 'fonts.css' not in content:
                            issues["missing_css"] = True
                        
                        # 2. ตรวจสอบการทำ Preload ฟอนต์แต่ละตัว
                        for font in REQUIRED_FONTS:
                            # เช็คว่ามีบรรทัดที่มีทั้ง rel="preload" และชื่อไฟล์ฟอนต์นั้นๆ หรือไม่
                            has_preload = any('rel="preload"' in line and font in line for line in lines)
                            if not has_preload:
                                issues["missing_preloads"].append(font)
                                
                    if issues["missing_css"] or issues["missing_preloads"]:
                        results.append((rel_path, issues))

                except Exception as e:
                    print(f"❌ ไม่สามารถอ่านไฟล์ {rel_path} ได้: {e}")

    print(f"📊 สรุปผลการตรวจสอบ ({count} ไฟล์):")
    if not results:
        print("✅ ยอดเยี่ยม! ทุกไฟล์ HTML มีการเชื่อมต่อ fonts.css และ Preload ครบถ้วนแล้ว")
        return

    for path, iss in results:
        print(f"\n📍 {path}")
        if iss["missing_css"]:
            print("  [ ] 🔴 ขาดการเชื่อมต่อ fonts.css")
        if iss["missing_preloads"]:
            print(f"  [ ] 🟡 ขาดการ Preload ฟอนต์ ({len(iss['missing_preloads'])} ตัว):")
            for f in iss["missing_preloads"]:
                print(f"      - {f}")

    print(f"\n⚠️ พบจุดที่ต้องแก้ไขทั้งหมด {len(results)} ไฟล์")

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    scan_html_assets(project_root)