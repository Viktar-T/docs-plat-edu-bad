import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <p className="hero__subtitle" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
          <a 
            href="https://wksir.zut.edu.pl/struktura-wydzialu/katedra-inzynierii-odnawialnych-zrodel-energii.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: 'inherit', textDecoration: 'underline'}}>
            Katedra Inżynierii Odnawialnych Źródeł Energii
          </a>
        </p>
        <p className="hero__subtitle" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
          <a 
            href="https://www.tlimc.szczecin.pl/"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: 'inherit', textDecoration: 'underline'}}>
            Technikum Łączności i Multimediów Cyfrowych w Szczecinie
          </a>
        </p>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="IoT Educational and Research Platform">
      <HomepageHeader />
      <main>
        <section className={styles.mainContent}>
          <div className="container">
            <div className="row">
              <div className={`col col--6 ${styles.imageColumn}`}>
                <div className={styles.imageWrapper}>
                  <img 
                    src="img/edu-bad-plat.png" 
                    alt="IoT Educational and Research Platform" 
                    className={styles.mainImage}
                  />
                </div>
              </div>
              <div className={`col col--6 ${styles.buttonsColumn}`}>
                <div className={styles.buttonsGrid}>
                  <Link
                    className={`${styles.navButton} ${styles.labEquipmentButton}`}
                    to="/docs/laboratories-and-equipment">
                    Laboratories & Equipment
                  </Link>
                  <Link
                    className={styles.navButton}
                    to="/docs/phases">
                    Project Phases
                  </Link>
                  <Link
                    className={styles.navButton}
                    to="/docs/Versions">
                    Versions
                  </Link>
                  <Link
                    className={styles.navButton}
                    to="/docs/references">
                    References
                  </Link>
                  <Link
                    className={styles.navButton}
                    to="/docs/contributors">
                    Contributors
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
