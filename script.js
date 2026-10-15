const { useState, useEffect } = React;

function ArunikaMixApp() {
  const [participants, setParticipants] = useState([
    "Agung Pranaja", "Aina Salsabil", "Ainul Mardhiah", "Azfar Syahmi Al Akbar", 
    "Fhyan Farikha Andi", "Khayla Eka Anugerah", "La Ode Abdul Raja Mananti", 
    "La Ode Muhammad Syaban Hasn...", "Mahira Hasna Kamila Mustam", "Muh. Nur Alim", 
    "Muhammad Fajar Ayyatullah An...", "Naizar Al Azmi K", "Nanda Saputri", 
    "Nur Zahwa Syarifuddin", "Peserta 15", "Peserta 16", "Peserta 17", "Peserta 18",
    "Peserta 19", "Peserta 20", "Peserta 21", "Peserta 22", "Peserta 23", "Peserta 24",
    "Peserta 25", "Peserta 26", "Peserta 27", "Peserta 28"
  ]);

  const [inputNames, setInputNames] = useState("");
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("pembagi");

  // Fungsi Tambah Peserta
  const handleAddParticipants = () => {
    if (!inputNames.trim()) return;
    const namesArray = inputNames
      .split("\n")
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setParticipants([...participants, ...namesArray]);
    setInputNames("");
  };

  // Fungsi Hapus Peserta
  const handleDeleteParticipant = (index) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
  };

  // Fungsi Reset Peserta
  const handleResetParticipants = () => {
    if (confirm("Reset seluruh daftar peserta?")) {
      setParticipants([]);
      setGroups([]);
    }
  };

  // Fungsi Acak Kelompok
  const handleShuffleGroups = () => {
    if (participants.length === 0 || groupCount < 1) return;
    
    let shuffled = [...participants].sort(() => Math.random() - 0.5);
    let result = Array.from({ length: Number(groupCount) }, () => []);

    shuffled.forEach((person, idx) => {
      result[idx % groupCount].push(person);
    });

    setGroups(result);
  };

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>Arunika<span className="brand-light">Mix</span></span>
        </div>
        <button className="copy-button">Masuk / Daftar Akun</button>
      </header>

      {/* HERO SECTION (Sesuai Layout Netlify) */}
      <section className="hero-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <i data-lucide="sparkles" size="14"></i>
            PEMBAGI KELOMPOK ACAK & MINI GAMES
          </div>
          <h1>Beri ruang<br /><em>untuk kejutan.</em></h1>
          <p>Ubah kerumunan menjadi tim-tim kecil atau undian seru secara adil tanpa repot.</p>
          
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#4b334d', fontFamily: 'DM Mono' }}>
              {participants.length}
            </span>
            <div style={{ fontSize: '10px', fontFamily: 'DM Mono', color: '#706b63', lineHeight: '1.2' }}>
              ORANG<br />DI DALAMNYA<br /><span style={{ borderTop: '1px solid #e6dfd5', paddingTop: '2px', display: 'inline-block', marginTop: '2px' }}>SATU TITIK AWAL YANG ADIL</span>
            </div>
          </div>
        </div>

        {/* LINGKARAN ORANYE / SUN CIRCLE (Khas Netlify) */}
        <div style={{
          width: '220px',
          height: '220px',
          backgroundColor: '#fbe8e0',
          borderRadius: '50%',
          position: 'absolute',
          right: '-20px',
          top: '-10px',
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>
      </section>

      {/* TAB NAVIGASI */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('pembagi')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e6dfd5',
            backgroundColor: activeTab === 'pembagi' ? '#4b334d' : '#fffefb',
            color: activeTab === 'pembagi' ? '#ffffff' : '#2c2925',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <i data-lucide="users" size="16"></i> Pembagi Kelompok
        </button>
        <button 
          onClick={() => setActiveTab('roda')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e6dfd5',
            backgroundColor: activeTab === 'roda' ? '#4b334d' : '#fffefb',
            color: activeTab === 'roda' ? '#ffffff' : '#2c2925',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <i data-lucide="disc" size="16"></i> Roda Putar (Spin Wheel)
        </button>
        <button 
          onClick={() => setActiveTab('duel')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e6dfd5',
            backgroundColor: activeTab === 'duel' ? '#4b334d' : '#fffefb',
            color: activeTab === 'duel' ? '#ffffff' : '#2c2925',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <i data-lucide="swords" size="16"></i> Undian Berpasangan (Duel)
        </button>
        <button 
          onClick={() => setActiveTab('antrean')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: '1px solid #e6dfd5',
            backgroundColor: activeTab === 'antrean' ? '#4b334d' : '#fffefb',
            color: activeTab === 'antrean' ? '#ffffff' : '#2c2925',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <i data-lucide="list-ordered" size="16"></i> Urutan Antrean / Giliran
        </button>
      </div>

      {/* WORKSPACE AREA */}
      <div className="workspace">
        {/* PANEL KIRI: DAFTAR PESERTA */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker"><i data-lucide="user" size="12"></i> PESERTA</div>
              <h2>Daftar peserta ({participants.length})</h2>
            </div>
            <div className="row-actions">
              <button className="icon-button delete-action" onClick={handleResetParticipants} title="Reset"><i data-lucide="trash-2" size="14"></i></button>
            </div>
          </div>
          <p className="panel-intro">Ketik satu nama atau tempel daftar nama panjang sekaligus di bawah ini (baris baru otomatis jadi nama terpisah).</p>

          <textarea 
            className="edit-input" 
            style={{ width: '100%', height: '80px', marginBottom: '12px', resize: 'vertical' }}
            placeholder="Ketik atau tempel daftar nama di sini..."
            value={inputNames}
            onChange={(e) => setInputNames(e.target.value)}
          ></textarea>

          <button className="shuffle-button" style={{ marginBottom: '16px' }} onClick={handleAddParticipants}>
            + Tambahkan ke Daftar
          </button>

          <div className="participant-list">
            {participants.map((person, i) => (
              <div className="participant-row" key={i}>
                <span className="person-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="person-name">{person}</span>
                <div className="row-actions">
                  <button className="row-action delete-action" onClick={() => handleDeleteParticipant(i)}><i data-lucide="trash-2" size="12"></i></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL KANAN: BERAPA KELOMPOK */}
        <div className="mix-panel">
          <div className="mix-topline">
            <div className="section-kicker"><i data-lucide="shuffle" size="12"></i> PEMBAGI KELOMPOK</div>
            <span style={{ fontSize: '10px', background: '#e6dfd5', padding: '2px 6px', borderRadius: '4px', fontFamily: 'DM Mono' }}>SIAP</span>
          </div>
          <h2>Berapa kelompok?</h2>
          <p className="mix-description">Ketik langsung jumlah kelompok yang diinginkan, lalu acak secara merata.</p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', color: '#706b63', display: 'block', marginBottom: '6px' }}>Jumlah Kelompok:</label>
            <input 
              type="number" 
              className="edit-input" 
              style={{ width: '100%', fontSize: '20px', textAlign: 'center', padding: '8px' }}
              value={groupCount}
              onChange={(e) => setGroupCount(e.target.value)}
              min="1"
            />
          </div>

          <div className="balance-note">
            <span className="balance-mark">≈ {Math.ceil(participants.length / (groupCount || 1))} per grup</span>
            <span className="balance-divider"></span>
            <span>seimbang</span>
          </div>

          <button className="shuffle-button" onClick={handleShuffleGroups}>
            <i data-lucide="shuffle" size="16"></i> Acak Kelompok &rarr;
          </button>
        </div>
      </div>

      {/* HASIL KELOMPOK */}
      {groups.length > 0 && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <div className="section-kicker">HASIL ACAKAN</div>
              <h2>Kelompokmu</h2>
            </div>
            <button className="copy-button" onClick={() => alert("Hasil disalin!")}>
              <i data-lucide="copy" size="14"></i> Salin Kelompok
            </button>
          </div>

          <div className="groups-grid">
            {groups.map((group, idx) => (
              <div className={`group-card group-${['coral', 'saffron', 'teal', 'plum'][idx % 4]}`} key={idx}>
                <div className="group-card-head">
                  <span className="group-number">Kelompok {idx + 1}</span>
                  <span>{group.length} Orang</span>
                </div>
                <div className="group-names">
                  {group.map((member, mIdx) => (
                    <div className="group-person" key={mIdx}>
                      <span className="member-dot"></span>
                      <span>{member}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Render Aplikasi
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ArunikaMixApp />);

// Render Ikon Lucide
setTimeout(() => {
  if (window.lucide) {
    lucide.createIcons();
  }
}, 300);
