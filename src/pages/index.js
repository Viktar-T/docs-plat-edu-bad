import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
          Katedra Inżynierii Odnawialnych Źródeł Energii
        </p>
        <p className="hero__subtitle" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
          Technikum Łączności i Multimediów Cyfrowych w Szczecinie
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
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className="col col--12">
                <div className="text--center">
                  <img 
                    src="/img/edu-bad-plat.png" 
                    alt="IoT Educational and Research Platform" 
                    style={{
                      maxWidth: '70%',
                      height: 'auto',
                      margin: '0.5rem auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
