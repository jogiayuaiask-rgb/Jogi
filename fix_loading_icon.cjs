const fs = require('fs');
let code = fs.readFileSync('src/components/ChatInterface.tsx', 'utf8');

code = code.replace(
  '<span className="material-symbols-outlined text-white">robot_2</span>',
  '<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGgs01u4LqNIs-kNCKM3sR2cMpkCek3wcIaqdHdxbDdm3lOFPOpy9P8D_1Qo3Av1NDbD_d3QSVAlEE0OBMVo-ypP7B7eom93ZLnKfwQknNrzeDNPWYRiDSXhH0HZxZ5u47klA2e7szvGLkMdun77pxNUfgvL8jF4R00JSjgIL4FISiI_drAH47FnYO8DDM6FkJtG_tAsN8s4YJDxxG1fAvOl3uwTlPKIthPzoPM-IxnfayYZyF2R32GWJ5w10lAVZfrZ-Iizc5oak" alt="JOGI Logo" className="w-6 h-6 object-contain filter brightness-0 invert opacity-50" />'
);

fs.writeFileSync('src/components/ChatInterface.tsx', code);
