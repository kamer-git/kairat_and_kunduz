import React, { useState, useEffect } from 'react';
import { translations, type Language, type Translations } from './translations';
import { submitRsvp } from './rsvpService';

function Countdown({ units }: { units: Translations['countdownUnits'] }) {
  const targetDate = new Date('2026-10-21T16:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };
    calculate();
    const interval = setInterval(calculate, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="animate-on-scroll" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 4260)', width: 'calc(var(--u) * 301)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'calc(var(--u) * 5)' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'calc(var(--u) * 15)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="t t-35 c-white">{formatNumber(timeLeft.days)}</span>
          <span className="t t-10 c-white" style={{ marginTop: 'calc(var(--u) * 5)' }}>{units.days}</span>
        </div>
        <span className="t t-35 c-white" style={{ paddingBottom: 'calc(var(--u) * 15)' }}>:</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="t t-35 c-white">{formatNumber(timeLeft.hours)}</span>
          <span className="t t-10 c-white" style={{ marginTop: 'calc(var(--u) * 5)' }}>{units.hours}</span>
        </div>
        <span className="t t-35 c-white" style={{ paddingBottom: 'calc(var(--u) * 15)' }}>:</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="t t-35 c-white">{formatNumber(timeLeft.minutes)}</span>
          <span className="t t-10 c-white" style={{ marginTop: 'calc(var(--u) * 5)' }}>{units.minutes}</span>
        </div>
        <span className="t t-35 c-white" style={{ paddingBottom: 'calc(var(--u) * 15)' }}>:</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="t t-35 c-white">{formatNumber(timeLeft.seconds)}</span>
          <span className="t t-10 c-white" style={{ marginTop: 'calc(var(--u) * 5)' }}>{units.seconds}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>('kg');
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [attendance, setAttendance] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const t = translations[lang];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const toggleSound = () => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio) {
      if (!audio.paused) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(e => {
          console.warn("Play failed", e);
        });
      }
    }
  };

  const handleEnvelopeClick = () => {
    setIsOpen(true);
    // Auto-play music if not already playing upon opening envelope
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio && audio.paused) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.log("Auto-play blocked by browser policy:", e);
      });
    }
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !attendance) {
      return;
    }

    // If "with spouse" is chosen but partner name is blank
    const isWithSpouse = attendance === t.rsvpOptions[1];
    if (isWithSpouse && !partnerName.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitRsvp({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        attendance,
        partnerName: isWithSpouse ? partnerName.trim() : undefined,
        language: lang,
        submittedAt: new Date().toISOString(),
      });
      setRsvpSubmitted(true);
    } catch (err) {
      setSubmitError(t.rsvpError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="frame">
      {/* Envelope - prioritized at top of DOM for instant loading and display */}
      <button
        type="button"
        className="envelope"
        data-open={isOpen}
        onClick={handleEnvelopeClick}
        aria-label={t.envelopeHint}
        tabIndex={0}
      >
        <span className="envelope-stage">
          <span style={{ position: 'absolute', left: 'calc(var(--u) * -37)', top: 'calc(var(--u) * 168)', width: 'calc(var(--u) * 395)', height: 'calc(var(--u) * 409.1)' }}>
            <img
              alt=""
              style={{ width: '100%', height: '100%' }}
              src="/img/envelope-body.svg"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </span>
          <span style={{ position: 'absolute', left: 'calc(var(--u) * -37)', top: 'calc(var(--u) * -8)', width: 'calc(var(--u) * 395)', height: 'calc(var(--u) * 420)' }}>
            <picture>
              <source srcSet="/img/envelope-front-round-seal-150.webp" type="image/webp" />
              <img
                alt=""
                style={{ width: '100%', height: '100%' }}
                src="/img/envelope-front-round-seal-150.png"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </picture>
          </span>
          <span className="envelope-hint">{t.envelopeHint}</span>
        </span>
      </button>

      <div className="canvas">
        {/* Background glow layers */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 3318.3)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 568.6)' }} aria-hidden="true">
          <img src="/img/glow-b.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Countdown background */}
        <span className="footer-photo" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 4168.4)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 192)' }} aria-hidden="true">
          <img src="/img/countdown-background.jpg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, objectFit: 'cover' }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 4168.4)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 192)' }} className="shape-black footer-shade"></span>
        
        {/* RSVP background shape */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 3675.4)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 493)' }} className="shape-olive"></span>
        
        {/* More glow layers */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 1330.1)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 568.6)' }} aria-hidden="true">
          <img src="/img/glow-b.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 2930.3)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 568.6)' }} aria-hidden="true">
          <img src="/img/glow-b.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 2478.3)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 568.6)' }} aria-hidden="true">
          <img src="/img/glow-b.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 1984.2)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 568.9)' }} aria-hidden="true">
          <img src="/img/glow-a.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 0)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 569)' }} aria-hidden="true">
          <img src="/img/glow-a.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Birds */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 45)', top: 'calc(var(--u) * 1344.1)', width: 'calc(var(--u) * 40)', height: 'calc(var(--u) * 33.9)' }} aria-hidden="true">
          <img src="/img/bird-close.webp" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 38)', top: 'calc(var(--u) * 474)', width: 'calc(var(--u) * 57)', height: 'calc(var(--u) * 48.3)' }} aria-hidden="true">
          <img src="/img/bird-close.webp" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Hands image */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 164)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 181.7)' }} aria-hidden="true">
          <img src="/img/hands.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Flying birds */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 248.7)', top: 'calc(var(--u) * 1315.1)', width: 'calc(var(--u) * 70.3)', height: 'calc(var(--u) * 47.9)' }} aria-hidden="true">
          <img src="/img/bird-fly-a.webp" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 219.2)', top: 'calc(var(--u) * 287.9)', width: 'calc(var(--u) * 82.6)', height: 'calc(var(--u) * 56.3)' }} aria-hidden="true">
          <img src="/img/bird-fly-a.webp" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Audio */}
        <audio
          id="bg-music"
          loop
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/theme.m4a" type="audio/mp4" />
          <source src="/audio.mp3" type="audio/mpeg" />
        </audio>
        
        {/* Top Left: Sound Button */}
        <button
          type="button"
          className="sound-btn"
          onClick={toggleSound}
          style={{ position: 'absolute', left: 'calc(var(--u) * 33)', top: 'calc(var(--u) * 29)', width: 'calc(var(--u) * 45)', zIndex: 9 }}
          aria-label={t.soundAria}
          id="sound-toggle-btn"
        >
          <svg viewBox="-2 -2 82 68" fill="none" aria-hidden="true" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <path d="M4 22.5h13.5L34 6.5a2 2 0 0 1 3.4 1.4v47.7a2 2 0 0 1-3.4 1.4L17.5 41H4a3 3 0 0 1-3-3V25.5a3 3 0 0 1 3-3Z" fill="#636b48"></path>
            <g stroke="#636b48" strokeWidth="5.4" strokeLinecap="round" fill="none">
              <path className="sound-wave" d="M48 22.5a17 17 0 0 1 0 19" style={{ opacity: isPlaying ? 1 : 0.2 }}></path>
              <path className="sound-wave" d="M58.5 14.5a29.5 29.5 0 0 1 0 35" style={{ opacity: isPlaying ? 1 : 0.2 }}></path>
              <path className="sound-wave" d="M69 6.5a42 42 0 0 1 0 51" style={{ opacity: isPlaying ? 1 : 0.2 }}></path>
            </g>
          </svg>
        </button>
        <p className="t animate-on-scroll t-13 c-ink t-nowrap" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 68)', width: 'calc(var(--u) * 89)', zIndex: 9 }}>
          {t.soundLabel[0]}<br />{t.soundLabel[1]}
        </p>
        
        {/* Top Right: Language Switcher (replacing previous scroll indicator) */}
        <div
          className="lang-switch"
          style={{
            position: 'absolute',
            left: 'calc(var(--u) * 228)',
            top: 'calc(var(--u) * 27)',
            width: 'calc(var(--u) * 78)',
            height: 'calc(var(--u) * 28)',
            borderRadius: 'calc(var(--u) * 14)',
            padding: 'calc(var(--u) * 2)',
            zIndex: 10,
          }}
          role="group"
          aria-label="Тилди тандоо / Тілді таңдау"
        >
          <button
            type="button"
            className={`lang-btn ${lang === 'kg' ? 'active' : ''}`}
            onClick={() => setLang('kg')}
            aria-pressed={lang === 'kg'}
            id="lang-btn-kg"
          >
            КЫРГ
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'kz' ? 'active' : ''}`}
            onClick={() => setLang('kz')}
            aria-pressed={lang === 'kz'}
            id="lang-btn-kz"
          >
            ҚАЗ
          </button>
        </div>
        
        {/* Calendar */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 28)', top: 'calc(var(--u) * 1627.2)', width: 'calc(var(--u) * 265)', height: 'calc(var(--u) * 181.7)' }}>
          <div className="cal">
            <div className="cal-head"><span>{t.calendarMonth}</span><span>2026</span></div>
            <div className="cal-rule"></div>
            <div className="cal-grid">
              {t.calendarWeekdays.map((wd, i) => (
                <span key={i} className="cal-wd">{wd}</span>
              ))}
              <span className="cal-day"></span><span className="cal-day"></span><span className="cal-day"></span><span className="cal-day">1</span><span className="cal-day">2</span><span className="cal-day">3</span><span className="cal-day">4</span>
              <span className="cal-day">5</span><span className="cal-day">6</span><span className="cal-day">7</span><span className="cal-day">8</span><span className="cal-day">9</span><span className="cal-day">10</span><span className="cal-day">11</span>
              <span className="cal-day">12</span><span className="cal-day">13</span><span className="cal-day">14</span><span className="cal-day">15</span><span className="cal-day">16</span><span className="cal-day">17</span><span className="cal-day">18</span>
              <span className="cal-day">19</span>
              <span className="cal-day">20</span>
              <span className="cal-day" style={{ position: 'relative' }}>
                <span
                  className="beat-soft"
                  style={{
                    position: 'absolute',
                    width: 'calc(var(--u) * 36)',
                    height: 'calc(var(--u) * 36)',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    margin: 'auto',
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                >
                  <img src="/img/heart.svg" alt="" style={{ width: '100%', height: '100%' }} />
                </span>
                <span style={{ position: 'relative', zIndex: 1, color: 'var(--color-olive)', fontWeight: 500 }}>21</span>
              </span>
              <span className="cal-day">22</span>
              <span className="cal-day">23</span>
              <span className="cal-day">24</span>
              <span className="cal-day">25</span><span className="cal-day">26</span><span className="cal-day">27</span><span className="cal-day">28</span><span className="cal-day">29</span><span className="cal-day">30</span><span className="cal-day">31</span>
            </div>
          </div>
        </span>
        
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 1813.2)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 319.8)' }} aria-hidden="true">
          <img src="/img/chandelier.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 8)', top: 'calc(var(--u) * 1330.1)', width: 'calc(var(--u) * 305)', height: 'calc(var(--u) * 203.3)' }} aria-hidden="true">
          <img src="/img/banquet.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Names SVG */}
        <svg className="hero-initials" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 363)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 95.4)' }} viewBox="0 0 1539.65 504.57" aria-hidden="true">
          <defs>
            <clipPath id="hero-initials-cut">
              <rect x="-500" y="-500" width="2540" height="646.25"></rect>
              <rect x="-500" y="373.88" width="2540" height="1000"></rect>
            </clipPath>
          </defs>
          <g clipPath="url(#hero-initials-cut)">
            <text x="350" y="492.75" fontSize="695" textAnchor="middle" fill="#636b48" fontFamily="'Playfair Display', serif">Б</text>
            <text x="1190" y="492.75" fontSize="695" textAnchor="middle" fill="#636b48" fontFamily="'Playfair Display', serif">А</text>
          </g>
          <text x="770" y="380" fontSize="210" textAnchor="middle" fill="#636b48" fontFamily="'Playfair Display', Georgia, serif" fontStyle="normal">&amp;</text>
        </svg>
        <span className="hero-script-name" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 397)', width: 'calc(var(--u) * 140)', height: 'calc(var(--u) * 35)', display: 'flex', justifyContent: 'center' }}>Байэл</span>
        <span className="hero-script-name" style={{ position: 'absolute', left: 'calc(var(--u) * 170)', top: 'calc(var(--u) * 397)', width: 'calc(var(--u) * 150)', height: 'calc(var(--u) * 35)', display: 'flex', justifyContent: 'center' }}>Алуа</span>
        
        {/* Florals */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * -31)', top: 'calc(var(--u) * 3047.3)', width: 'calc(var(--u) * 147)', height: 'calc(var(--u) * 92.9)' }} aria-hidden="true">
          <img src="/img/floral-left.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * -28)', top: 'calc(var(--u) * 1282.1)', width: 'calc(var(--u) * 147)', height: 'calc(var(--u) * 92.9)' }} aria-hidden="true">
          <img src="/img/floral-left.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * -28)', top: 'calc(var(--u) * 537.1)', width: 'calc(var(--u) * 147)', height: 'calc(var(--u) * 92.9)' }} aria-hidden="true">
          <img src="/img/floral-left.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 216)', top: 'calc(var(--u) * 3344.3)', width: 'calc(var(--u) * 152)', height: 'calc(var(--u) * 96.1)' }} aria-hidden="true">
          <img src="/img/floral-right.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 201)', top: 'calc(var(--u) * 1472.1)', width: 'calc(var(--u) * 152)', height: 'calc(var(--u) * 96.1)' }} aria-hidden="true">
          <img src="/img/floral-right.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 201)', top: 'calc(var(--u) * 527.1)', width: 'calc(var(--u) * 152)', height: 'calc(var(--u) * 96.1)' }} aria-hidden="true">
          <img src="/img/floral-right.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        <span className="shape-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 623.1)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 671.1)', borderRadius: 'calc(var(--u) * 200)' }}></span>
        
        {/* Conjunction "менен" / "мен" */}
        <p className="t animate-on-scroll t-17 c-white" style={{ position: 'absolute', left: 'calc(var(--u) * 117)', top: 'calc(var(--u) * 962.1)', width: 'calc(var(--u) * 87)' }}>
          {t.and}
        </p>
        
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 63.2)', top: 'calc(var(--u) * 2041.4)', width: 'calc(var(--u) * 76.9)', height: 'calc(var(--u) * 52.3)' }} aria-hidden="true">
          <img src="/img/bird-fly-b.webp" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        {/* Timeline Details */}
        <p className="t animate-on-scroll t-15 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 2694.3)', width: 'calc(var(--u) * 110)', textAlign: 'right', textShadow: '0 0 6px #f7f0e4, 0 0 10px #f7f0e4' }}>
          21:00<br /><span>{t.timeline.t21[0]}<br /></span><span>{t.timeline.t21[1]}</span>
        </p>
        <p className="t animate-on-scroll t-15 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 2430.3)', width: 'calc(var(--u) * 110)', textAlign: 'right', textShadow: '0 0 6px #f7f0e4, 0 0 10px #f7f0e4' }}>
          17:00<br /><span>{t.timeline.t17[0]}<br /></span><span>{t.timeline.t17[1]}</span>
        </p>
        <p className="t animate-on-scroll t-15 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 200)', top: 'calc(var(--u) * 2789.3)', width: 'calc(var(--u) * 110)', textAlign: 'left', textShadow: '0 0 6px #f7f0e4, 0 0 10px #f7f0e4' }}>
          22:00<br /><span>{t.timeline.t22[0]}<br /></span><span>{t.timeline.t22[1]}</span>
        </p>
        <p className="t animate-on-scroll t-15 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 200)', top: 'calc(var(--u) * 2553.3)', width: 'calc(var(--u) * 110)', textAlign: 'left', textShadow: '0 0 6px #f7f0e4, 0 0 10px #f7f0e4' }}>
          19:30<br /><span>{t.timeline.t19_30[0]}<br /></span><span>{t.timeline.t19_30[1]}</span>
        </p>
        <p className="t animate-on-scroll t-15 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 200)', top: 'calc(var(--u) * 2282.2)', width: 'calc(var(--u) * 110)', textAlign: 'left', textShadow: '0 0 6px #f7f0e4, 0 0 10px #f7f0e4' }}>
          16:00<br /><span>{t.timeline.t16[0]}<br /></span><span>{t.timeline.t16[1]}</span>
        </p>
        
        <h2 className="t animate-on-scroll t-20 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 2160.2)', width: 'calc(var(--u) * 301)' }}>
          {t.programTitle}
        </h2>
        
        <p className="t animate-on-scroll t-16 c-white" style={{ position: 'absolute', left: 'calc(var(--u) * 15)', top: 'calc(var(--u) * 3790.4)', width: 'calc(var(--u) * 290)' }}>
          <span>{t.rsvpNotice[0]}<br /></span><span>{t.rsvpNotice[1]}</span>
        </p>
        <p className="t animate-on-scroll t-17 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 15)', top: 'calc(var(--u) * 3467.4)', width: 'calc(var(--u) * 290)' }}>
          <span>{t.hostsIntro[0]}<br /></span><span><br /></span><span>{t.hostsIntro[1]}</span>
        </p>
        
        <Countdown units={t.countdownUnits} />
        <h2 className="t animate-on-scroll t-20 c-white" style={{ position: 'absolute', left: 'calc(var(--u) * 14)', top: 'calc(var(--u) * 4188.4)', width: 'calc(var(--u) * 301)' }}>
          {t.countdownTitle}
        </h2>
        
        <h2 className="t animate-on-scroll t-35 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 3130)', width: 'calc(var(--u) * 301)' }}>
          {t.venueName}
        </h2>
        <p className="t animate-on-scroll t-17 c-olive" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 3190)', width: 'calc(var(--u) * 301)' }}>
          {t.venueType}<br />{t.venueAddress[0]}<br />{t.venueAddress[1]}
        </p>
        <a
          href="https://2gis.kg/bishkek/geo/70000001112761356"
          className="animate-on-scroll"
          target="_blank"
          rel="noopener noreferrer"
          style={{ position: 'absolute', left: 'calc(var(--u) * 40)', top: 'calc(var(--u) * 3280)', width: 'calc(var(--u) * 241)', height: 'calc(var(--u) * 45)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#636b48', color: '#ffffff', textDecoration: 'none', fontSize: 'calc(var(--u) * 14)', fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '300' }}
        >
          {t.mapButton}
        </a>
        
        <p className="t animate-on-scroll t-17 c-white" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 1108.1)', width: 'calc(var(--u) * 301)' }}>
          <span>{t.invitationBody[0]}<br /></span>
          <span>{t.invitationBody[1]}<br /></span>
          <span>{t.invitationBody[2]}<br /></span>
          <span>{t.invitationBody[3]}</span>
        </p>
        <p className="t animate-on-scroll t-17 c-white" style={{ position: 'absolute', left: 'calc(var(--u) * 10)', top: 'calc(var(--u) * 750.1)', width: 'calc(var(--u) * 301)' }}>
          <span>{t.greetingIntro[0]}<br /></span>
          <span>{t.greetingIntro[1]}<br /></span>
          <span><br /></span>
          <span>{t.greetingIntro[2]}</span>
        </p>
        
        <h2 className="script-box animate-on-scroll" style={{ position: 'absolute', left: 'calc(var(--u) * 28)', top: 'calc(var(--u) * 3700.4)', width: 'calc(var(--u) * 233)', height: 'calc(var(--u) * 79.5)' }}>
          <span className="script c-cream" style={{ fontSize: 'calc(var(--u) * 46)' }}>{t.rsvpTitle}</span>
        </h2>
        
        <div style={{ position: 'absolute', left: 'calc(var(--u) * 15)', top: 'calc(var(--u) * 3858.4)', width: 'calc(var(--u) * 290)' }}>
          {rsvpSubmitted ? (
            <div style={{ padding: 'calc(var(--u) * 24)', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'calc(var(--u) * 12)', textAlign: 'center', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: 'calc(var(--u) * 28)', marginBottom: 'calc(var(--u) * 10)' }}>✓</div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'calc(var(--u) * 15)', lineHeight: 1.5 }}>
                {t.rsvpSuccess}
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={handleRsvpSubmit}>
              <div className="name-row">
                <input
                  className="form-input"
                  type="text"
                  autoComplete="family-name"
                  placeholder={t.rsvpLastNamePlaceholder}
                  aria-label={t.rsvpLastNamePlaceholder}
                  required
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
                <input
                  className="form-input"
                  type="text"
                  autoComplete="given-name"
                  placeholder={t.rsvpFirstNamePlaceholder}
                  aria-label={t.rsvpFirstNamePlaceholder}
                  required
                  name="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              </div>

              <p className="form-question" id="rsvp-question">{t.rsvpQuestion}</p>
              <fieldset className="form-options" aria-labelledby="rsvp-question">
                <label className="form-option">
                  <input
                    type="radio"
                    required
                    name="answer"
                    value={t.rsvpOptions[0]}
                    checked={attendance === t.rsvpOptions[0]}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <span className="form-dot"></span><span>{t.rsvpOptions[0]}</span>
                </label>
                <label className="form-option">
                  <input
                    type="radio"
                    required
                    name="answer"
                    value={t.rsvpOptions[1]}
                    checked={attendance === t.rsvpOptions[1]}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <span className="form-dot"></span><span>{t.rsvpOptions[1]}</span>
                </label>
                <label className="form-option">
                  <input
                    type="radio"
                    required
                    name="answer"
                    value={t.rsvpOptions[2]}
                    checked={attendance === t.rsvpOptions[2]}
                    onChange={(e) => setAttendance(e.target.value)}
                  />
                  <span className="form-dot"></span><span>{t.rsvpOptions[2]}</span>
                </label>
              </fieldset>

              {attendance === t.rsvpOptions[1] && (
                <input
                  className="form-input"
                  type="text"
                  placeholder={t.rsvpPartnerPlaceholder}
                  aria-label={t.rsvpPartnerPlaceholder}
                  required
                  name="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                />
              )}

              {submitError && (
                <p className="form-error">{submitError}</p>
              )}

              <button
                className="form-submit"
                type="submit"
                disabled={isSubmitting}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {isSubmitting ? t.rsvpSubmitting : t.rsvpSubmit}
              </button>
            </form>
          )}
        </div>
        
        <p className="script-box animate-on-scroll" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 3563.4)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 77.4)', display: 'flex', justifyContent: 'center' }}>
          <span className="script c-olive" style={{ fontSize: 'calc(var(--u) * 42)' }}>{t.hostsNames}</span>
        </p>
        <p className="script-box animate-on-scroll" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 1005.1)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 88.9)', display: 'flex', justifyContent: 'center' }}>
          <span className="script c-cream" style={{ fontSize: 'calc(var(--u) * 52)' }}>{t.bridePossessive}</span>
        </p>
        
        <p className="script-box animate-on-scroll" style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 883.1)', width: 'calc(var(--u) * 320)', height: 'calc(var(--u) * 92.3)', display: 'flex', justifyContent: 'center' }}>
          <span className="script c-cream" style={{ fontSize: 'calc(var(--u) * 52)' }}>Байэл</span>
        </p>
        
        {/* Timeline images */}
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 208)', top: 'calc(var(--u) * 2663.3)', width: 'calc(var(--u) * 94)', height: 'calc(var(--u) * 101.6)' }} aria-hidden="true">
          <img src="/img/prog-cake.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 175)', top: 'calc(var(--u) * 2421.3)', width: 'calc(var(--u) * 130)', height: 'calc(var(--u) * 88.2)' }} aria-hidden="true">
          <img src="/img/prog-plate.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 8)', top: 'calc(var(--u) * 2783.3)', width: 'calc(var(--u) * 131)', height: 'calc(var(--u) * 87.4)' }} aria-hidden="true">
          <img src="/img/prog-car.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 32)', top: 'calc(var(--u) * 2507.3)', width: 'calc(var(--u) * 87)', height: 'calc(var(--u) * 160.1)' }} aria-hidden="true">
          <img src="/img/prog-couple.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 0)', top: 'calc(var(--u) * 2253.2)', width: 'calc(var(--u) * 163)', height: 'calc(var(--u) * 158.9)' }} aria-hidden="true">
          <img src="/img/prog-table.png" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 81)', top: 'calc(var(--u) * 2332.2)', width: 'calc(var(--u) * 156)', height: 'calc(var(--u) * 726.9)' }} aria-hidden="true">
          <img src="/img/timeline.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
        <span style={{ position: 'absolute', left: 'calc(var(--u) * 224)', top: 'calc(var(--u) * 3012.3)', width: 'calc(var(--u) * 35)', height: 'calc(var(--u) * 47.2)' }} aria-hidden="true">
          <img src="/img/pin.svg" alt="" style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0 }} />
        </span>
        
      </div>
      <p className="sr-only">{t.srOnly}</p>
    </main>
  );
}
