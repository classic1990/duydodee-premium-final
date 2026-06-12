/**
 * 🎬 DUYดูDEE USER FOOTER COMPONENT
 * รวมศูนย์เมนูและข้อมูลส่วนท้ายของเว็บไซต์
 */

export const UserFooter = {
    render: () => {
        const footer = document.getElementById('main-footer');
        if (!footer) return;

        footer.innerHTML = `
            <footer class="bg-brand-black border-t border-white/5 pt-16 pb-8 mt-20">
                <div class="container mx-auto px-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <!-- Branding & Description -->
                        <div class="space-y-6">
                            <img src="/assets/logo/DUYDODEE.png" class="h-10" alt="DUYดูDEE-HD" onerror="this.src='https://ui-avatars.com/api/?name=D&background=FBBF24&color=000'">
                            <p class="text-gray-500 text-sm leading-relaxed Thai-font">
                                แหล่งรวมความบันเทิงระดับพรีเมียม ดูหนัง ซีรีส์ และละครย้อนหลัง คุณภาพคมชัดระดับ HD พร้อมระบบสตรีมมิ่งที่รวดเร็วและทันสมัยที่สุด
                            </p>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h4 class="text-white font-black uppercase tracking-widest text-xs mb-6 Thai-font">เมนูหลัก</h4>
                            <ul class="space-y-4 text-gray-500 text-sm Thai-font">
                                <li><a href="/" class="hover:text-brand-primary transition-colors">หน้าแรก</a></li>
                                <li><a href="/movies.html" class="hover:text-brand-primary transition-colors">ภาพยนตร์ทั้งหมด</a></li>
                                <li><a href="/series.html" class="hover:text-brand-primary transition-colors">ซีรีส์ยอดฮิต</a></li>
                                <li><a href="/trending.html" class="hover:text-brand-primary transition-colors">มาใหม่วันนี้</a></li>
                            </ul>
                        </div>

                        <!-- Support -->
                        <div>
                            <h4 class="text-white font-black uppercase tracking-widest text-xs mb-6 Thai-font">ช่วยเหลือ</h4>
                            <ul class="space-y-4 text-gray-500 text-sm Thai-font">
                                <li><a href="#" class="hover:text-brand-primary transition-colors">คำถามที่พบบ่อย</a></li>
                                <li><a href="#" class="hover:text-brand-primary transition-colors">แจ้งปัญหาการใช้งาน</a></li>
                                <li><a href="#" class="hover:text-brand-primary transition-colors">ติดต่อลงโฆษณา</a></li>
                            </ul>
                        </div>

                        <!-- Social & Community -->
                        <div>
                            <h4 class="text-white font-black uppercase tracking-widest text-xs mb-6 Thai-font">ติดตามเรา</h4>
                            <div class="flex gap-4">
                                <a href="#" class="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-black transition-all group">
                                    <i data-lucide="facebook" class="w-5 h-5 group-hover:scale-110"></i>
                                </a>
                                <a href="#" class="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-black transition-all group">
                                    <i data-lucide="twitter" class="w-5 h-5 group-hover:scale-110"></i>
                                </a>
                                <a href="#" class="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-primary hover:text-black transition-all group">
                                    <i data-lucide="instagram" class="w-5 h-5 group-hover:scale-110"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            © 2024 DUYDODEE-HD. ALL RIGHTS RESERVED.
                        </p>
                        <div class="flex gap-6 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                            <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
        if (window.lucide) window.lucide.createIcons();
    }
};