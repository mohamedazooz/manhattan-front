export interface StudentLifeClubConfig {
  id: string;
  category: 'stem' | 'sports' | 'arts' | 'leadership';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  scheduleAr: string;
  scheduleEn: string;
  locationAr: string;
  locationEn: string;
}

export interface StudentLifePillarConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconName?: string;
}

export interface StudentLifeFullConfig {
  badgeAr: string;
  badgeEn: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  statClubs: string;
  statSports: string;
  statEvents: string;
  statParticipation: string;
  clubs: StudentLifeClubConfig[];
  pillars: StudentLifePillarConfig[];
}

export const DEFAULT_STUDENT_LIFE_CONFIG: StudentLifeFullConfig = {
  badgeAr: 'حياة طلابية مفعمة بالحيوية والابتكار',
  badgeEn: 'Vibrant & Innovative Student Life',
  heroTitleAr: 'اكتشف شغفك وابتكر مستقبلك في مدرسة مانهاتن للغات',
  heroTitleEn: 'Discover Your Passion & Build Your Future at MLS',
  heroSubtitleAr:
    'بيئة ترفيهية وتعليمية متكاملة تجمع بين التميز الأكاديمي، الأنشطة الرياضية، الفنون، ونوادي التكنولوجيا والقيادة لتأهيل قادة الغد.',
  heroSubtitleEn:
    'A holistic educational and extracurricular ecosystem empowering student talent through robotics, sports academies, fine arts, and leadership initiatives.',
  statClubs: '+15',
  statSports: '+10',
  statEvents: '+50',
  statParticipation: '100%',
  clubs: [
    {
      id: 'robotics',
      category: 'stem',
      titleAr: 'نادي الروبوتات والذكاء الاصطناعي',
      titleEn: 'Robotics & AI Lab',
      descAr: 'تصميم وبرمجة الروبوتات الذكية والانظمة المدمجة والمشاركة في المسابقات التكنولوجية الأولمبية.',
      descEn: 'Design and program smart robots, embedded systems, and compete in national tech olympiads.',
      scheduleAr: 'الأحد والأربعاء - 02:30 م',
      scheduleEn: 'Sun & Wed - 02:30 PM',
      locationAr: 'معمل التكنولوجيا والابتكار المتقدم',
      locationEn: 'Advanced Tech & Innovation Lab',
    },
    {
      id: 'football',
      category: 'sports',
      titleAr: 'أكاديمية كرة القدم والرياضات الميدانية',
      titleEn: 'Football & Athletics Academy',
      descAr: 'تدريبات اللياقة البدنية والمهارات التكتيكية وتحضير فرق المدرسة للبطولات المحلية والإقليمية.',
      descEn: 'Fitness training, tactical skills, and preparing school teams for regional leagues.',
      scheduleAr: 'الاثنين والخميس - 03:00 م',
      scheduleEn: 'Mon & Thu - 03:00 PM',
      locationAr: 'الملعب الرياضي الرئيسي والمجمع الأولمبي',
      locationEn: 'Main Sports Complex & Turf',
    },
    {
      id: 'theatre',
      category: 'arts',
      titleAr: 'استوديو المسرح المدرسي والدراما',
      titleEn: 'School Theatre & Performing Arts',
      descAr: 'تطوير مهارات الإلقاء والتعبير الجسدي والتمثيل المسرحي وتقديم العروض السنوية باللغتين العربية والإنجليزية.',
      descEn: 'Developing public speaking, acting, and theatrical expression through annual bilingual plays.',
      scheduleAr: 'الثلاثاء والسبت - 02:30 م',
      scheduleEn: 'Tue & Sat - 02:30 PM',
      locationAr: 'المسرح الرئيسي المجهز بأحدث أجهزة الصوت',
      locationEn: 'Grand Auditorium & Stage',
    },
    {
      id: 'fine-arts',
      category: 'arts',
      titleAr: 'مرسم الفنون التشكيلية والتصميم الرقمي',
      titleEn: 'Fine Arts & Digital Design Studio',
      descAr: 'تنمية مهارات الرسم والترميم والتصميم الجرافيكي وإقامة المعارض الفنية السنوية للطلاب.',
      descEn: 'Developing painting, sculpture, and graphic design skills with annual gallery exhibitions.',
      scheduleAr: 'الثلاثاء - 02:30 م',
      scheduleEn: 'Tuesday - 02:30 PM',
      locationAr: 'مرسم مانهاتن للفنون الجملية',
      locationEn: 'Manhattan Fine Arts Studio',
    },
    {
      id: 'mun',
      category: 'leadership',
      titleAr: 'نموذج الأمم المتحدة والقيادة الدبلوماسية (MUN)',
      titleEn: 'Model United Nations & Leadership',
      descAr: 'تدريب الطلاب على التناظر والدبلوماسية وحل القضايا الدولية والخطابة والتفاوض القيادي.',
      descEn: 'Training students in debate, global diplomacy, international relations, and negotiation skills.',
      scheduleAr: 'الأربعاء - 03:00 م',
      scheduleEn: 'Wednesday - 03:00 PM',
      locationAr: 'قاعة المؤتمرات الدولية والمحاكاة',
      locationEn: 'International Conference Hall',
    },
    {
      id: 'astronomy',
      category: 'stem',
      titleAr: 'نادي الفلك والأبحاث الفضائية',
      titleEn: 'Astronomy & Space Science Club',
      descAr: 'استكشاف الأجرام السماوية باستخدام التلسكوبات الحديثة، ودراسة علوم الفضاء وتجارب الفيزياء التطبيقية.',
      descEn: 'Observing celestial bodies using modern telescopes and exploring space physics experiments.',
      scheduleAr: 'الخميس - 03:30 م',
      scheduleEn: 'Thursday - 03:30 PM',
      locationAr: 'المرصد الفلكي وقبة العلوم بالمدرسة',
      locationEn: 'School Planetarium & Observatory',
    },
    {
      id: 'chess',
      category: 'leadership',
      titleAr: 'نادي الشطرنج والتفكير الاستراتيجي',
      titleEn: 'Chess & Strategic Mind Club',
      descAr: 'صقل مهارات التخطيط والتحليل المنطقي والتركيز الذهني من خلال دوريات الشطرنج والتحديات الفكرية.',
      descEn: 'Sharpening strategic planning, logical thinking, and focus through school chess leagues.',
      scheduleAr: 'الاثنين - 02:30 م',
      scheduleEn: 'Monday - 02:30 PM',
      locationAr: 'قاعة الأنشطة الذهنية والذكاء',
      locationEn: 'Mind Sports & Strategy Lounge',
    },
    {
      id: 'music',
      category: 'arts',
      titleAr: 'أكاديمية الموسيقى والكورال المدرسي',
      titleEn: 'Music & School Choir Academy',
      descAr: 'تعلم العزف على الآلات الموسيقية المتنوعة، وتنمية الحس الموسيقي للمشاركة في الحفلات القومية.',
      descEn: 'Instrumental training and vocal harmony preparing students for national music showcases.',
      scheduleAr: 'الأحد - 03:00 م',
      scheduleEn: 'Sunday - 03:00 PM',
      locationAr: 'استوديو الصوتيات والموسيقى المجهزة',
      locationEn: 'Sound & Music Recording Studio',
    },
  ],
  pillars: [
    {
      id: 'p-1',
      titleAr: 'التميز الرياضي والصحة البدنية',
      titleEn: 'Athletics & Physical Fitness',
      descAr: 'مجمعات رياضية متكاملة وملاعب أولمبية تشجع الطالب على ممارسة النشاط وصقل الروح الرياضية.',
      descEn: 'Olympic-grade athletic facilities fostering teamwork, stamina, and healthy habits.',
    },
    {
      id: 'p-2',
      titleAr: 'الابتكار العلمي والعلوم الحديثة',
      titleEn: 'STEM Innovation & Technology',
      descAr: 'معامل تفاعلية متطورة للروبوتات والتطبيقات الذكية تمنح الطالب الشغف بالاكتشاف وتطوير الحلول.',
      descEn: 'Hands-on tech labs empowering students to create software, robotics, and scientific models.',
    },
    {
      id: 'p-3',
      titleAr: 'التعبير الفني والدراما التفاعلية',
      titleEn: 'Arts & Creative Performing',
      descAr: 'مساحات إبداعية ومسارح حديثة تسمح للطلاب بالتعبير عن الذات واكتشاف المواهب الموسيقية والفنية.',
      descEn: 'Inspiring spaces for music, theatrical performance, fine arts, and visual storytelling.',
    },
    {
      id: 'p-4',
      titleAr: 'القيادة الشابة والمواطنة الفاعلة',
      titleEn: 'Leadership & Global Citizenship',
      descAr: 'نماذج محاكاة دولية، مجالس طلابية، ومبادرات مجتمعية تصنع شخصية قادرة على إحداث الفارق.',
      descEn: 'Student councils, MUN conferences, and community projects building responsible future leaders.',
    },
  ],
};
