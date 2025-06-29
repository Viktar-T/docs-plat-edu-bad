import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'IoT Platforma Edu-Badawcza',

  future: {
    v4: true,
  },

  url: 'https://viktar-t.github.io',
  baseUrl: '/docs-plat-edu-bad/',

  organizationName: 'Viktar-T',
  projectName: 'docs-plat-edu-bad',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/Viktar-T/docs-plat-edu-bad/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: {
      image: 'img/edu-bad-plat.png',
      navbar: {
        title: 'Main Page',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'https://github.com/Viktar-T/docs-plat-edu-bad',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Instytucje',
            items: [
              {
                label: 'Katedra Inżynierii Odnawialnych Źródeł Energii',
                href: 'https://wksir.zut.edu.pl/struktura-wydzialu/katedra-inzynierii-odnawialnych-zrodel-energii.html',
              },
              {
                label: 'Technikum Łączności i Multimediów Cyfrowych w Szczecinie',
                href: 'https://tlimc.szczecin.pl/',
              },
            ],
          },
          {
            title: 'Repositories',
            items: [
              {
                label: 'GitHub - Documentation',
                href: 'https://github.com/Viktar-T/docs-plat-edu-bad',
              },
              {
                label: 'GitHub - FrontEnd',
                href: '#',
              },
              {
                label: 'GitHub - BackEnd',
                href: '#',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} IoT Platforma Edu-Badawcza. Open source project for educational and research purposes.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
  },
};

export default config;
