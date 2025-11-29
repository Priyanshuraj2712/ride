import React from "react";
import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
  return (
    <div className="home-root">
      <div className="home-bg" />



      <main className="home-hero expanded">
        <section className="hero-card glass hero-large">
          <div className="hero-left">
            <h1 className="hero-title">Ridezy</h1>
            <p className="hero-tag">Experience the future of mobility</p>

            <p className="hero-sub">
              Ridezy is a decentralized platform for cost-effective, peer-to-peer ride-sharing. The platform builds trust for private vehicle owners to offer carpooling services, leveraging AI for intelligent matching & anomaly detection and IoT for real-time data to ensure safe, low-wait time transportation.
            </p>

            <div className="proverbs">
              <strong>Future of mobility</strong>
              <span> • Experience the future</span>
            </div>

            <div className="cta-row hero-cta">
              <Link to="/register" className="btn btn-primary large">Create Account</Link>
              <Link to="/login" className="btn btn-ghost large">Sign In</Link>
            </div>
          </div>

          <aside className="hero-right visual glass">
            <div className="visual-inner">
              <div className="viz-pulse" />
              <div className="viz-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="viz-text">Decentralized • Safe • Smart</div>
            </div>
          </aside>
        </section>

        <section className="features-panel">
          <div className="feature-card glass">
            <h3>What Ridezy Does</h3>
            <p>
              We connect riders with trusted private vehicle owners to create low-cost, low-wait travel options. Using AI for intelligent matching and anomaly detection, combined with IoT-fed telemetry, Ridezy optimizes routes and improves safety in real time.
            </p>
            <ul>
              <li>V2V / V2I Communication Network</li>
              <li>Real-time Vision Pipeline</li>
              <li>Sensor-Verified Credibility Scoring</li>
              <li>Real-Time Safety Monitoring</li>
              <li>Cost Efficiency & Fairness</li>
            </ul>
          </div>

          <div className="how-card glass">
            <h3>How it works</h3>
            <ol>
              <li>Sign up and set your preferences.</li>
              <li>Request a ride - AI finds the closest trusted match.</li>
              <li>Track the vehicle live; confirm with OTP at start/end.</li>
              <li>Rate & review to reward trusted drivers.</li>
            </ol>
            <div className="mini-stats">
              <div className="stat"><strong>24%</strong><span>Avg cost saved</span></div>
              <div className="stat"><strong>99%</strong><span>On-time pickups</span></div>
              <div className="stat"><strong>4.9</strong><span>Avg driver rating</span></div>
            </div>
          </div>
        </section>

        <section className="community-panel glass">
          <h3>Community & Governance</h3>
          <p>
            Ridezy is built for community governance and transparency. Decisions around policies, incentives and moderation are shared and auditable to empower users.
          </p>
          <div className="feature-list-compact">
            <div>Privacy Empowerment</div>
            <div>Foundation for Autonomous Fleets</div>
            <div>Smart City Integration</div>
            <div>Community Governance</div>
          </div>
        </section>
      </main>

      
    </div>
  );
};

export default Home;
