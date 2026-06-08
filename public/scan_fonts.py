import os
from pathlib import Path

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
    public_dir = Path(base_path) / 'public'
    results = []
    count = 0

    print(f"🔍 เริ่มต้นการสแกน Cinematic Assets ใน: {public_dir}\n")

    if not public_dir.exists():
        print(f"❌ ไม่พบโฟลเดอร์ public ที่: {public_dir}")
        return

    for html_file in public_dir.rglob("*.html"):
        # ข้ามไฟล์ยืนยันสิทธิ์ของ Google
        if html_file.name == 'google5b9a52936674cf70.html':
            continue

        count += 1
        rel_path = html_file.relative_to(base_path)
        issues = {"missing_css": False, "missing_preloads": []}
        
        try:
            content = html_file.read_text(encoding='utf-8')
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
    # คำนวณหา root ของโปรเจกต์จากตำแหน่งไฟล์นี้
    project_root = Path(__file__).resolve().parent.parent
    scan_html_assets(project_root)