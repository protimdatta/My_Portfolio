
    /* ─── PARTICLES ─────────────────────────────────────── */
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * 2000, y: Math.random() * 2000,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
        col: Math.random() > 0.5 ? 'rgba(212,170,255,' : 'rgba(255,179,217,'
      });
    }
    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x % W, p.y % H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + (0.3 + Math.random() * 0.15) + ')';
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();

    /* ─── HERO 3D CANVAS ─────────────────────────────────── */
    (function() {
      const c = document.getElementById('hero3d');
      const g = c.getContext('2d');
      let cW, cH, t = 0;

      function resizeC() {
        cW = c.width = c.offsetWidth;
        cH = c.height = c.offsetHeight;
      }
      resizeC();
      window.addEventListener('resize', resizeC);

      /* Geometry: vertices of an icosahedron-like structure */
      const phi = (1 + Math.sqrt(5)) / 2;
      const baseVerts = [
        [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
        [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
        [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
      ];
      const edges = [
        [0,1],[0,5],[0,7],[0,10],[0,11],
        [1,5],[1,7],[1,8],[1,9],
        [2,3],[2,4],[2,10],[2,11],
        [3,4],[3,6],[3,8],[3,9],
        [4,5],[4,9],[4,11],
        [5,9],[5,11],
        [6,7],[6,8],[6,10],
        [7,8],[7,10],
        [8,9],[10,11]
      ];

      /* Inner ring dots (floating skill nodes) */
      const skillNodes = [
        { label: 'HTML', angle: 0 },
        { label: 'CSS', angle: Math.PI * 2 / 5 },
        { label: 'JavaScript', angle: Math.PI * 4 / 5 },
        { label: 'React', angle: Math.PI * 6 / 5 },
        { label: 'Node', angle: Math.PI * 8 / 5 }
      ];

      function rotate3D(v, rx, ry) {
        let [x, y, z] = v;
        // rotate Y
        let x1 = x * Math.cos(ry) + z * Math.sin(ry);
        let z1 = -x * Math.sin(ry) + z * Math.cos(ry);
        // rotate X
        let y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
        return [x1, y2, z2];
      }

      function project(v, cx, cy, scale) {
        const fov = 4.5;
        const z = v[2] + fov;
        const px = cx + (v[0] / z) * scale;
        const py = cy + (v[1] / z) * scale;
        const depth = (v[2] + 3) / 6; // 0-1
        return { x: px, y: py, depth };
      }

      /* Mouse interaction */
      let mouseX = 0, mouseY = 0;
      const hero = document.getElementById('hero');
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mouseX = (e.clientX - r.left) / r.width - 0.5;
        mouseY = (e.clientY - r.top) / r.height - 0.5;
      });

      let targetRX = 0, targetRY = 0, curRX = 0, curRY = 0;

      function draw3D() {
        t += 0.008;
        targetRY = t + mouseX * 1.2;
        targetRX = -0.3 + mouseY * 0.6;
        curRX += (targetRX - curRX) * 0.04;
        curRY += (targetRY - curRY) * 0.04;

        g.clearRect(0, 0, cW, cH);

        const cx = cW / 2;
        const cy = cH / 2;
        const scale = Math.min(cW, cH) * 0.32;
        const norm = Math.sqrt(1 + phi * phi); // normalise icosahedron

        // Project all vertices
        const projected = baseVerts.map(v => {
          const nv = v.map(c => c / norm);
          const rv = rotate3D(nv, curRX, curRY);
          return project(rv, cx, cy, scale);
        });

        /* Draw edges */
        edges.forEach(([a, b]) => {
          const pa = projected[a], pb = projected[b];
          const avgDepth = (pa.depth + pb.depth) / 2;
          const alpha = 0.35 + avgDepth * 0.65;
          const r = Math.round(200 + avgDepth * 55);
          const gv = Math.round(160 + avgDepth * 60);
          const bv = Math.round(255);
          g.beginPath();
          g.moveTo(pa.x, pa.y);
          g.lineTo(pb.x, pb.y);
          g.strokeStyle = `rgba(${r},${gv},${bv},${alpha})`;
          g.lineWidth = 1.1 + avgDepth * 1.1;
          g.stroke();
        });

        /* Draw vertex dots */
        projected.forEach(p => {
          const r = 3 + p.depth * 4;
          const alpha = 0.65 + p.depth * 0.35;
          g.beginPath();
          g.arc(p.x, p.y, r, 0, Math.PI * 2);
          const grad = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
          grad.addColorStop(0, `rgba(255,200,230,${alpha})`);
          grad.addColorStop(0.5, `rgba(255,140,200,${alpha * 0.7})`);
          grad.addColorStop(1, `rgba(212,170,255,0)`);
          g.fillStyle = grad;
          g.fill();
        });

        /* Orbiting ring */
        const ringR = scale * 0.72;
        g.beginPath();
        g.ellipse(cx, cy, ringR, ringR * 0.32, curRY * 0.3, 0, Math.PI * 2);
        g.strokeStyle = 'rgba(212,170,255,0.32)';
        g.lineWidth = 1.5;
        g.stroke();

        /* Skill nodes orbiting */
        skillNodes.forEach((node, i) => {
          const a = node.angle + t * 0.6 + i * 0.1;
          const nr = scale * 0.78;
          const nx = cx + Math.cos(a) * nr;
          const ny = cy + Math.sin(a) * nr * 0.3;
          const nDepth = Math.sin(a) * 0.5 + 0.5;
          const nAlpha = 0.6 + nDepth * 0.4;

          /* dot glow */
          const ndGrad = g.createRadialGradient(nx, ny, 0, nx, ny, 7 + nDepth * 5);
          ndGrad.addColorStop(0, `rgba(255,200,230,${nAlpha})`);
          ndGrad.addColorStop(0.4, `rgba(255,140,200,${nAlpha * 0.7})`);
          ndGrad.addColorStop(1, 'rgba(255,140,200,0)');
          g.beginPath();
          g.arc(nx, ny, 7 + nDepth * 5, 0, Math.PI * 2);
          g.fillStyle = ndGrad;
          g.fill();

          /* dot core */
          g.beginPath();
          g.arc(nx, ny, 3.5 + nDepth * 2.5, 0, Math.PI * 2);
          g.fillStyle = `rgba(255,210,235,${nAlpha})`;
          g.fill();

          /* label — visible even at low depth */
          if (nDepth > 0.15) {
            const fs = 11 + nDepth * 3;
            g.font = `600 ${fs}px Inter, sans-serif`;
            g.textAlign = 'center';
            /* text shadow simulation */
            g.fillStyle = `rgba(0,0,0,${nAlpha * 0.5})`;
            g.fillText(node.label, nx + 1, ny - 11);
            g.fillStyle = `rgba(240,210,255,${nAlpha})`;
            g.fillText(node.label, nx, ny - 12);
          }
        });

        /* Central glow */
        const cGrad = g.createRadialGradient(cx, cy, 0, cx, cy, scale * 0.42);
        cGrad.addColorStop(0, `rgba(200,130,255,${0.22 + Math.sin(t * 1.5) * 0.08})`);
        cGrad.addColorStop(0.5, `rgba(160,80,220,${0.12 + Math.sin(t * 1.5) * 0.04})`);
        cGrad.addColorStop(1, 'rgba(180,100,255,0)');
        g.beginPath();
        g.arc(cx, cy, scale * 0.42, 0, Math.PI * 2);
        g.fillStyle = cGrad;
        g.fill();

        /* ── Equatorial dot ring (90° to skill-node orbit) ── */
        const eqR = scale * 0.72;
        const eqDotCount = 28;
        for (let d = 0; d < eqDotCount; d++) {
          const a = (d / eqDotCount) * Math.PI * 2 + t * 0.35;
          const ex = cx + Math.cos(a) * eqR * Math.cos(curRY + Math.PI / 2) - Math.sin(a) * eqR * 0.28 * Math.sin(curRX);
          const ey = cy + Math.sin(a) * eqR * 0.28 * Math.cos(curRX) + Math.cos(a) * eqR * Math.sin(curRY + Math.PI / 2) * 0.15;
          const eDepth = Math.sin(a + curRY) * 0.5 + 0.5;
          const eAlpha = 0.45 + eDepth * 0.55;
          const dotR = 1.8 + eDepth * 2.4;
          g.beginPath();
          g.arc(ex, ey, dotR, 0, Math.PI * 2);
          /* Radial glow per dot for extra visibility */
          const dGrad = g.createRadialGradient(ex, ey, 0, ex, ey, dotR * 2.2);
          dGrad.addColorStop(0, `rgba(220,190,255,${eAlpha})`);
          dGrad.addColorStop(0.5, `rgba(200,150,255,${eAlpha * 0.7})`);
          dGrad.addColorStop(1, `rgba(180,100,255,0)`);
          g.fillStyle = dGrad;
          g.fill();
        }

        /* Outer glow ring pulse */
        const pulseR = scale * (0.85 + Math.sin(t * 1.2) * 0.06);
        const pGrad = g.createRadialGradient(cx, cy, pulseR * 0.82, cx, cy, pulseR);
        pGrad.addColorStop(0, 'rgba(212,170,255,0)');
        pGrad.addColorStop(0.55, `rgba(220,180,255,${0.18 + Math.sin(t) * 0.08})`);
        pGrad.addColorStop(0.8, `rgba(255,160,210,${0.10 + Math.sin(t) * 0.05})`);
        pGrad.addColorStop(1, 'rgba(212,170,255,0)');
        g.beginPath();
        g.arc(cx, cy, pulseR, 0, Math.PI * 2);
        g.fillStyle = pGrad;
        g.fill();

        /* Hard outer ring stroke for crisp definition */
        g.beginPath();
        g.arc(cx, cy, pulseR * 0.97, 0, Math.PI * 2);
        g.strokeStyle = `rgba(220,180,255,${0.22 + Math.sin(t * 1.2) * 0.10})`;
        g.lineWidth = 1.2;
        g.stroke();

        requestAnimationFrame(draw3D);
      }
      draw3D();
    })();

    /* ─── PARALLAX ORBS (scroll + mouse) ────────────────── */
    const orbs = document.querySelectorAll('.hero-orb');
    const orbOffsets = Array.from(orbs).map(() => ({ sx: 0, sy: 0, mx: 0, my: 0, tx: 0, ty: 0 }));
    const mouseStrengths = [52, 38, 24];

    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = parseFloat(orb.dataset.speed) || 0.05;
        orbOffsets[i].sy = sy * speed;
        applyOrbTransform(i);
      });
    });

    const heroEl = document.getElementById('hero');
    heroEl.addEventListener('mousemove', e => {
      const rect = heroEl.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      orbs.forEach((orb, i) => {
        const str = mouseStrengths[i] / (rect.width / 2);
        orbOffsets[i].tx = cx * str;
        orbOffsets[i].ty = cy * str;
      });
    });

    function lerp(a, b, t) { return a + (b - a) * t; }
    function animateOrbs() {
      orbs.forEach((orb, i) => {
        orbOffsets[i].mx = lerp(orbOffsets[i].mx || 0, orbOffsets[i].tx || 0, 0.06);
        orbOffsets[i].my = lerp(orbOffsets[i].my || 0, orbOffsets[i].ty || 0, 0.06);
        applyOrbTransform(i);
      });
      requestAnimationFrame(animateOrbs);
    }
    animateOrbs();

    function applyOrbTransform(i) {
      const o = orbOffsets[i];
      const mx = o.mx || 0, my = o.my || 0, sy = o.sy || 0;
      orbs[i].style.transform = `translate(${mx}px, ${my + sy}px)`;
    }

    /* ─── LIGHT / DARK TOGGLE ────────────────────────────── */
    const toggle = document.getElementById('toggle');
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('light');
      toggle.classList.toggle('active');
    });

    /* ─── SCROLL REVEAL ──────────────────────────────────── */
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), idx * 60);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));

    /* ─── 3D TILT ────────────────────────────────────────── */
    document.querySelectorAll('.project-card, .step, .why-right, .edu-block').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)';
      });
    });

    /* ─── PROJECT MODAL DATA ─────────────────────────────── */
    const projects = {
      portfolio: {
        badge: '01 · Portfolio', emoji: '💻',
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        title: 'Personal Portfolio', role: 'Full-stack Developer',
        overview: 'I built my personal portfolio website to showcase my projects, skills, and experience as a MERN stack developer. The site features smooth animations, responsive design, and interactive project cards with detailed case studies. It serves as both a professional landing page and a demonstration of my web development capabilities.',
        problem: 'I needed a platform to effectively present my work and skills to potential employers and clients. A static resume wasn\'t enough to showcase my development abilities and project details.',
        goals: ['Create a visually appealing portfolio', 'Showcase MERN stack skills', 'Provide detailed project case studies', 'Ensure mobile responsiveness', 'Enable easy contact and social integration'],
        myRole: ['Full-stack Development', 'UI/UX Design', 'Frontend Development', 'Responsive Design', 'Animation Implementation'],
        process: [
          { step: 'Design', detail: 'Created a modern design with smooth animations, gradient backgrounds, and interactive elements using Figma.' },
          { step: 'Frontend Development', detail: 'Built responsive HTML, CSS with animations, and JavaScript for interactive components and smooth scrolling.' },
          { step: 'Content Structure', detail: 'Organized project case studies with problem statements, solutions, tools used, and outcomes for each project.' },
          { step: 'Optimization', detail: 'Optimized for performance with lazy loading, smooth scrolling, and efficient CSS animations.' }
        ],
        highlights: ['Smooth hero animations and parallax effects', 'Interactive 3D canvas visualization', 'Detailed project case study modals', 'Responsive design for all devices', 'Integrated contact information and social links', 'Light/Dark mode toggle'],
        tools: ['HTML', 'CSS', 'JavaScript', 'Canvas API', 'Responsive Design'],
        tags: ['Portfolio', 'Responsive', 'Animations', 'Interactive', 'Front-end'],
        outcome: 'The portfolio successfully presents my work and skills with an engaging, interactive experience. It effectively communicates my capabilities as a MERN developer and makes it easy for potential employers to explore my projects and get in touch.',
        style: 'Purple and gradient backgrounds with smooth animations create a modern, professional, and engaging portfolio experience.'
      },
      smoothies: {
        badge: '03 · Landing Page', emoji: '🍓',
        bg: 'linear-gradient(135deg, #3a0d6e 0%, #d966a8 100%)',
        title: 'Smoothies Land', role: 'UI/UX Designer',
        overview: 'I designed a modern and vibrant smoothie landing page focused on promoting healthy lifestyle products through an engaging visual experience. The goal was to create a fresh, energetic interface that increases product discovery and encourages online orders. The design direction was inspired by colorful fruit palettes, minimal layouts, and smooth user interactions.',
        problem: 'Many smoothie brand websites feel outdated, cluttered, and lack emotional connection with users. Customers struggle to quickly browse flavors, nutritional details, and promotions on mobile devices.',
        goals: ['Create a visually appealing first impression', 'Improve mobile responsiveness', 'Highlight smoothie flavors with strong visual hierarchy', 'Increase CTA engagement and product exploration'],
        myRole: ['UX Research', 'Wireframing', 'UI Design', 'Prototyping', 'Responsive Design'],
        process: [
          { step: 'Research', detail: 'Analyzed modern food & beverage websites. Users preferred fast menu scanning, bright energetic visuals, clear nutritional info, and simple checkout journeys.' },
          { step: 'Wireframing', detail: 'Low-fidelity wireframes focused on hero banner structure, product showcase sections, CTA placement, and mobile-first navigation.' },
          { step: 'UI Design', detail: 'Final interface used vibrant fruit-inspired gradients, bold typography, large product imagery, and smooth hover animations.' }
        ],
        highlights: ['Hero section with product highlights', 'Smooth scrolling interface', 'Interactive menu cards', 'Call-to-action sections', 'Responsive mobile layout'],
        tools: ['Figma', 'Adobe Photoshop', 'Illustrator'],
        tags: ['UI Design', 'Figma', 'Responsive', 'Branding', 'Wireframing'],
        outcome: 'The final landing page delivered a clean and engaging experience that reflected freshness and healthy living. The interface improved readability, product visibility, and overall user engagement.',
        style: 'Soft pink and purple gradients combined with clean white space create a fresh and welcoming user experience.'
      },
      weather: {
        badge: '02 · Mobile App', emoji: '🌤️',
        bg: 'linear-gradient(135deg, #1a0840 0%, #9955ee 55%, #ff99cc 100%)',
        title: 'Weather Application', role: 'UI/UX Designer',
        overview: 'This project focused on designing a modern weather application that transforms weather data into a simple and user-friendly experience. The app provides real-time forecasts, activity suggestions, and intuitive visual indicators for different weather conditions.',
        problem: 'Most weather apps overload users with technical information, making it difficult to quickly understand weather conditions or make daily decisions.',
        goals: ['Simplify weather information', 'Improve readability', 'Create an engaging mobile experience', 'Provide quick daily insights'],
        myRole: ['UX Research', 'User Flow Design', 'Mobile UI Design', 'Interactive Prototyping'],
        process: [
          { step: 'Research', detail: 'Users wanted minimal interfaces, faster access to forecasts, personalized weather updates, and easy-to-read icons and charts.' },
          { step: 'User Flow', detail: 'Designed streamlined navigation focused on current weather, hourly forecast, weekly forecast, and activity suggestions.' },
          { step: 'Visual Design', detail: 'UI included dynamic color themes based on weather, minimal cards with clean spacing, animated weather icons, and modern typography.' },
          { step: 'Challenge', detail: 'Balancing detailed weather information with a clean interface — solved using progressive disclosure and visual prioritization.' }
        ],
        highlights: ['Real-time weather display with search functionality', 'Temperature and condition cards', 'Clean mobile-first interface', 'Light and dark visual sections', 'Simplified layout reducing visual clutter'],
        tools: ['Figma', 'Adobe XD', 'Principle'],
        tags: ['UX Design', 'Mobile', 'Minimal UI', 'Figma', 'Prototyping'],
        outcome: 'The final design improved usability and made weather forecasting more engaging, accessible, and visually appealing.',
        style: 'Minimal, calm tones with strong typographic hierarchy ensure users get what they need instantly.'
      },
      brand: {
        badge: '03 · Website', emoji: '🌐',
        bg: 'linear-gradient(135deg, #200840 0%, #aa66ff 55%, #ff88bb 100%)',
        title: 'International Brand Website', role: 'UI/UX Designer',
        overview: 'This project involved designing a responsive website for an international brand focused on creating a premium and trustworthy digital identity. The website needed to appeal to global audiences while maintaining modern branding consistency.',
        problem: 'The brand lacked a strong online presence and struggled to communicate credibility, professionalism, and product quality to international customers.',
        goals: ['Build a premium brand experience', 'Improve user trust', 'Create responsive layouts for all devices', 'Increase global engagement'],
        myRole: ['UX Strategy', 'UI Design', 'Responsive Web Design', 'Brand Identity Integration'],
        process: [
          { step: 'Research', detail: 'Studied international brand websites — users valued clean navigation, high-quality visuals, fast loading speed, and consistent branding.' },
          { step: 'Wireframes', detail: 'Focused on global navigation structure, product showcase hierarchy, CTA placement, and responsive content blocks.' },
          { step: 'UI Design', detail: 'Interface used luxury-inspired typography, neutral color palettes, large visual storytelling sections, and minimal elegant layouts.' }
        ],
        highlights: ['Modern hero banners with premium typography', 'High-end product showcase sections', 'Responsive grid layouts', 'Smooth visual balance and brand storytelling', 'Interactive navigation with modern UI patterns'],
        tools: ['Figma', 'Webflow', 'Adobe Illustrator'],
        tags: ['Branding', 'UI Design', 'Visual Design', 'Figma', 'Typography'],
        outcome: 'The redesigned website successfully communicated professionalism and improved the brand\'s online identity with a modern and responsive experience.',
        style: 'Deep tones, premium white space, and editorial typography communicate luxury and trust.'
      },
      menu: {
        badge: '04 · Menu Design', emoji: '🍽️',
        bg: 'linear-gradient(135deg, #3d0a28 0%, #cc55aa 100%)',
        title: 'Digital Menu Page', role: 'UI/UX Designer',
        overview: 'The digital menu page was designed for a restaurant to improve how customers browse food items online. The goal was to create an interactive, mobile-friendly menu experience with easy navigation and visually appealing food presentation.',
        problem: 'Traditional PDF menus were difficult to browse on mobile devices and lacked interactivity, nutritional information, and efficient navigation.',
        goals: ['Improve menu accessibility', 'Enhance mobile usability', 'Simplify menu browsing', 'Add visual and nutritional details'],
        myRole: ['UX Research', 'Menu Architecture', 'UI Design', 'Prototyping'],
        process: [
          { step: 'Research', detail: 'Users preferred visual food previews, fast category navigation, nutritional information, and search & filter options.' },
          { step: 'Information Architecture', detail: 'Menu structure divided into categories, popular items, search functionality, and dietary filters.' },
          { step: 'UI Design', detail: 'Final design included large food images, interactive menu cards, modern typography, and sticky navigation tabs.' },
          { step: 'Challenge', detail: 'Managing large menu information without overwhelming users — solved through careful spacing, hierarchy, and filtering systems.' }
        ],
        highlights: ['Organized food categories with clear hierarchy', 'Product cards with pricing and descriptions', 'Responsive menu layouts for mobile and desktop', 'Modern typography for easy scanning', 'Soft feminine color palette for elegance'],
        tools: ['Figma', 'Adobe XD', 'Photoshop'],
        tags: ['UI Design', 'Typography', 'Figma', 'Responsive', 'Visual Design'],
        outcome: 'The final digital menu improved customer browsing experience, reduced friction, and made online ordering more intuitive and engaging.',
        style: 'Light pink and purple color tones create a stylish and welcoming dining atmosphere.'
      },
      ecommerce: {
        badge: '02 · E-commerce', emoji: '🛒',
        bg: 'linear-gradient(135deg, #1a3a52 0%, #2e8b9e 55%, #00d4ff 100%)',
        title: 'E-commerce Website', role: 'MERN Stack Developer',
        overview: 'I built a full-stack e-commerce platform using the MERN stack with features including dynamic product catalog, shopping cart management, user authentication, payment integration, and order tracking. The platform is optimized for performance and provides a seamless shopping experience.',
        problem: 'Many e-commerce platforms lack proper backend architecture, suffer from slow load times, or have poor inventory management. Users struggle with checkout processes and payment security.',
        goals: ['Build scalable backend with Node.js and Express', 'Create responsive React frontend', 'Implement secure user authentication', 'Integrate payment gateway', 'Optimize database queries with MongoDB'],
        myRole: ['Full-stack Development', 'Backend API Design', 'Database Architecture', 'Frontend Integration', 'Payment Integration'],
        process: [
          { step: 'Backend Setup', detail: 'Designed RESTful API with Node.js and Express, structured database schema with MongoDB, implemented user authentication with JWT tokens.' },
          { step: 'Database Design', detail: 'Created collections for users, products, orders, and payments. Optimized queries for fast product searches and cart operations.' },
          { step: 'Frontend Development', detail: 'Built responsive React components for product listing, product details, shopping cart, and checkout. Implemented state management with Redux or Context API.' },
          { step: 'Payment Integration', detail: 'Integrated payment gateway (Stripe/SSLCommerz), implemented order processing, and added order tracking functionality.' }
        ],
        highlights: ['Product catalog with filtering and search', 'Secure user authentication and profiles', 'Shopping cart with real-time updates', 'Payment gateway integration', 'Order history and tracking', 'Admin panel for product management'],
        tools: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT', 'Stripe/SSLCommerz'],
        tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Full-stack', 'Payment Integration'],
        outcome: 'The e-commerce platform successfully handles multiple concurrent users, provides smooth checkout experience, and allows secure transactions with proper inventory management.',
        style: 'Modern blue gradients with clean UI elements create a trustworthy and professional shopping environment.'
      }
    };

    function openModal(key) {
      const p = projects[key];
      document.getElementById('modalBadge').textContent = p.badge;
      document.getElementById('modalEmoji').textContent = p.emoji;
      document.getElementById('modalHeader').style.background = p.bg;
      document.getElementById('modalTitle').textContent = p.title;
      document.getElementById('modalRole').textContent = p.role;
      document.getElementById('modalContent').innerHTML = `
        <div class="modal-section"><h4>Project Overview</h4><p>${p.overview}</p></div>
        <div class="modal-divider"></div>
        <div class="modal-section"><h4>Problem</h4><p>${p.problem}</p></div>
        <div class="modal-divider"></div>
        <div class="modal-grid">
          <div class="modal-grid-item"><strong>Goals</strong><ul style="list-style:none;display:flex;flex-direction:column;gap:5px;margin-top:4px;">${p.goals.map(g=>`<li style="font-size:12px;color:var(--muted);display:flex;align-items:flex-start;gap:7px;"><span style="color:var(--pink);flex-shrink:0;">→</span>${g}</li>`).join('')}</ul></div>
          <div class="modal-grid-item"><strong>My Role</strong><ul style="list-style:none;display:flex;flex-direction:column;gap:5px;margin-top:4px;">${p.myRole.map(r=>`<li style="font-size:12px;color:var(--muted);display:flex;align-items:flex-start;gap:7px;"><span style="color:var(--accent);flex-shrink:0;">·</span>${r}</li>`).join('')}</ul></div>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-section"><h4>Design Process</h4><div style="display:flex;flex-direction:column;gap:14px;">${p.process.map((s,i)=>`<div style="display:flex;gap:14px;align-items:flex-start;"><div style="flex-shrink:0;width:26px;height:26px;border-radius:50%;background:rgba(200,182,255,0.12);border:1px solid rgba(200,182,255,0.22);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--accent);font-weight:600;">${String(i+1).padStart(2,'0')}</div><div><div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px;letter-spacing:0.03em;">${s.step}</div><div style="font-size:13px;color:var(--muted);line-height:1.7;">${s.detail}</div></div></div>`).join('')}</div></div>
        <div class="modal-divider"></div>
        <div class="modal-section"><h4>Key Features</h4><ul>${p.highlights.map(h=>`<li>${h}</li>`).join('')}</ul></div>
        <div class="modal-divider"></div>
        <div class="modal-section"><h4>Design Style</h4><p>${p.style}</p></div>
        <div class="modal-divider"></div>
        <div class="modal-section" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div><h4 style="margin-bottom:10px;">Tools Used</h4><div class="modal-tags">${p.tools.map(t=>`<span class="modal-tag" style="background:rgba(255,179,217,0.08);border-color:rgba(255,179,217,0.18);color:var(--pink);">${t}</span>`).join('')}</div></div>
          <div><h4 style="margin-bottom:10px;">Skills Applied</h4><div class="modal-tags">${p.tags.map(t=>`<span class="modal-tag">${t}</span>`).join('')}</div></div>
        </div>
        <div class="modal-divider"></div>
        <div class="modal-outcome"><strong style="color:var(--accent);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;display:block;margin-bottom:8px;">✦ Final Outcome</strong>${p.outcome}</div>
      `;
      document.getElementById('modalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function closeModalOnBg(e) {
      if (e.target === document.getElementById('modalOverlay')) closeModal();
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ─── NAV SMOOTH SCROLL + ACTIVE HIGHLIGHT ───────────── */
    function navTo(e, id) {
      e.preventDefault();
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(id);
    }

    function setActiveNav(id) {
      const links = document.querySelectorAll('.nav-right a');
      const bar   = document.getElementById('navLinks');
      links.forEach(a => {
        a.classList.remove('nav-active');
        const href = a.getAttribute('href').replace('#', '');
        if (href === id) {
          a.classList.add('nav-active');
          /* slide the underline bar */
          const aRect   = a.getBoundingClientRect();
          const barRect = bar.getBoundingClientRect();
          bar.style.setProperty('--ind-left',  (aRect.left  - barRect.left)  + 'px');
          bar.style.setProperty('--ind-width', aRect.width + 'px');
          bar.style.cssText += `;--ind-left:${aRect.left - barRect.left}px;--ind-width:${aRect.width}px`;
          bar.querySelector('::after'); // force repaint hint
          /* direct ::after manipulation via CSS custom props */
          bar.style.cssText = bar.style.cssText; // noop flush
        }
      });
      /* Apply via inline style override on the pseudo – we use a real div instead */
      moveIndicator(id);
    }

    /* Real indicator element (more reliable than ::after manipulation) */
    (function createIndicator() {
      const bar = document.getElementById('navLinks');
      const ind = document.createElement('span');
      ind.id = 'navIndicator';
      ind.style.cssText = `
        position:absolute; bottom:-7px; left:0;
        height:2px; width:0; border-radius:999px;
        background:linear-gradient(90deg,var(--pink),var(--accent));
        transition: left 0.38s cubic-bezier(0.4,0,0.2,1),
                    width 0.38s cubic-bezier(0.4,0,0.2,1),
                    opacity 0.3s ease;
        opacity:0; pointer-events:none;
      `;
      bar.appendChild(ind);
    })();

    function moveIndicator(id) {
      const bar  = document.getElementById('navLinks');
      const ind  = document.getElementById('navIndicator');
      const link = bar.querySelector(`a[href="#${id}"]`);
      if (!link || !ind) return;
      const aRect   = link.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      ind.style.opacity = '1';
      ind.style.left  = (aRect.left - barRect.left) + 'px';
      ind.style.width = aRect.width + 'px';
    }

    // Highlight nav link on scroll using IntersectionObserver
    const navSections = ['about', 'projects', 'process', 'contact'];
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveNav(entry.target.id);
      });
    }, { threshold: 0.35 });
    navSections.forEach(id => {
      const el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });

    /* ─── HERO BUTTON INTERACTIONS ───────────────────────── */
    function heroNavTo(e, id) {
      e.preventDefault();
      /* ripple */
      addRipple(e, e.currentTarget);
      /* small delay so ripple is visible before scroll */
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveNav(id);
      }, 180);
    }

    /* "Get in Touch" — ripple then open mailto */
    document.getElementById('btnGetInTouch').addEventListener('click', function(e) {
      e.preventDefault();
      addRipple(e, this);
      setTimeout(() => {
        window.location.href = 'mailto:protim939@gmail.com';
      }, 200);
    });

    function addRipple(e, btn) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    }

    /* Boot-up indicator animation on load */
    window.addEventListener('load', () => {
      setTimeout(() => moveIndicator('about'), 600);
    });

    /* ─── TYPEWRITER ─────────────────────────────────────── */
    const typeRoles = ['MERN Developer', 'Full-stack Dev', 'React Developer', 'Backend Engineer'];
    let typeIndex = 0, charIndex = 0, isDeleting = false;
    const typeEl = document.getElementById('typewriter');

    function typeWrite() {
      const current = typeRoles[typeIndex];
      if (isDeleting) {
        typeEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typeEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }
      let delay = isDeleting ? 60 : 110;
      if (!isDeleting && charIndex === current.length) {
        delay = 1800; isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        typeIndex = (typeIndex + 1) % typeRoles.length;
        delay = 400;
      }
      setTimeout(typeWrite, delay);
    }
    typeWrite();
  const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if(hamburger){
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    hamburger.innerHTML =
      navLinks.classList.contains("active")
      ? "✕"
      : "☰";
  });
}
    