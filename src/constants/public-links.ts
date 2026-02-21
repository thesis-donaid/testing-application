const PUBLIC_LINK = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    href: '',
    label: 'Programs',
    children:[
        {href: '/program/misyonero', label: 'Misyonero', image: ''},
        {href: '/program/binhi', label: 'Binhi'},
        {href: '/program/youthalive', label: 'Youth Alive'},
        {href: '/program/kids-activity', label: 'Kid\'s Activity'},
        {href: '/program/gap-year', label: 'Gap Year'}
    ]
  },
  { href: '/Our Impact', label: 'Our Impact',
    children:[
      {href: '/OurImpact/CollegeGraduates', label: 'College Graduates', image: ''},
      {href: '/OurImpact/ScholarsStories', label: 'Scholars Stories', image: ''},
      {href: '/OurImpact/Testimonials', label: 'Testimonials', image: ''},

    ]
   }
];

const ADMIN_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/requests',  label: 'Requests' }

]


export default PUBLIC_LINK;