const { useState, useMemo, useRef, useEffect } = React;

const ORIGINAL_PARTICIPANTS = [
  'Agung Pranaja', 'Aina Salsabil', 'Ainul Mardhiah', 'Azfar Syahmi Al Akbar',
  'Fhyan Farikha Andi', 'Iffanda Putri Vallendini', 'Kansya Asqira Madhani Alam',
  'Khayla Eka Anugerah', 'La Ode Abdul Raja Mananti', 'La Ode Muhammad Syaban Hasnan',
  'Mahira Hasna Kamila Mustam', 'Muh. Nur Alim', 'Muhammad Fajar Ayyatullah An Nur',
  'Naizar Al Azmi K', 'Nanda Saputri', 'Nur Zahwa Syarifuddin', 'Nurul Mutmainnah',
  'Oriza Putri Virany H.', 'Raslan Syarsid', 'Rasya Muhammad Athaya',
  'Sahlaa Zahidah Hawwaa M.', 'Wa Ode Dini Dzakirah Lukman', 'Wa Ode Kamalia Putri',
  'Wa Ode Ibnaty Nurul Aini S.', 'Waldan Risallah Ampaeja', 'Wa Ode Zalni Nining Pratiwi',
  'Zaim Andrias Adhimukti', 'Zakiyah Khoirunnisa'
];

const GROUP_COLORS = ['coral', 'saffron', 'teal', 'plum', 'sky', 'rose', 'mint', 'ochre'];

const Icon = ({ name, size = 16, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = `<i data-lucide="${name}" style="width:${size}px; height:${size}px;"></i>`;
      if (window.lucide) {
        window.lucide.createIcons({
          nameAttr: 'data-lucide',
          attrs: { class: className }
        });
      }
    }
  }, [name, size, className]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }} />;
};

function createGroups(names, count) {
  const shuffled = [...names];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    names: shuffled.filter((_, personIndex) => personIndex % count === index)
  }));
}

function Home() {
  const [participants, setParticipants] = useState(ORIGINAL_PARTICIPANTS);
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState([]);
  const [newName, setNewName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  // Features: History, Templates, Spin Wheel
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([
    { name: 'Daftar Bawaan', list: ORIGINAL_PARTICIPANTS }
  ]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  
  // Spin Wheel State
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState(null);

  const noticeTimer = useRef(null);

  const effectiveGroupCount = Math.min(groupCount, Math.max(2, participants.length));

  const groupSizeLabel = useMemo(() => {
    if (!participants.length) return 'Belum ada yang dibagi';
    const smallest = Math.floor(participants.length / effectiveGroupCount);
    const largest = Math.ceil(participants.length / effectiveGroupCount);
    return smallest === largest ? `${smallest} per grup` : `${smallest}–${largest} per grup`;
  }, [effectiveGroupCount, participants.length]);

  const showNotice = (message) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2800);
  };

  const shuffleGroups = () => {
    if (!participants.length || isShuffling) return;
    setIsShuffling(true);
    setCopied(false);

    window.setTimeout(() => {
      const generated = createGroups(participants, effectiveGroupCount);
      setGroups(generated);
      setIsShuffling(false);
      showNotice('Kelompok siap!');

      // Tambahkan ke History
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [{ id: Date.now(), time: timeString, data: generated }, ...prev]);
    }, 420);
  };

  const addParticipant = () => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    if (participants.some((person) => person.toLowerCase() === cleanName.toLowerCase())) {
      showNotice('Nama itu sudah ada di daftar');
      return;
    }

    setParticipants((current) => [...current, cleanName]);
    setNewName('');
    setGroups([]);
    showNotice(`${cleanName} ditambahkan`);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Hilangkan duplikat dari list saat ini
    const existing = new Set(participants.map(p => p.toLowerCase()));
    const newAdded = [];
    lines.forEach(name => {
      if (!existing.has(name.toLowerCase())) {
        newAdded.push(name);
        existing.add(name.toLowerCase());
      }
    });

    if (newAdded.length === 0) {
      showNotice('Semua nama sudah ada di daftar');
    } else {
      setParticipants(prev => [...prev, ...newAdded]);
      showNotice(`${newAdded.length} nama berhasil ditambahkan`);
    }

    setBulkText('');
    setShowBulkModal(false);
    setGroups([]);
  };

  const removeParticipant = (index) => {
    const person = participants[index];
    setParticipants((current) => current.filter((_, personIndex) => personIndex !== index));
    setGroups([]);
    showNotice(`${person} dihapus`);
  };

  const saveEdit = (index) => {
    const cleanName = editingName.trim();
    if (!cleanName) return;

    if (participants.some((person, personIndex) => personIndex !== index && person.toLowerCase() === cleanName.toLowerCase())) {
      showNotice('Nama itu sudah ada di daftar');
      return;
    }

    setParticipants((current) => current.map((person, personIndex) => (personIndex === index ? cleanName : person)));
    setEditingIndex(null);
    setGroups([]);
    showNotice('Nama diperbarui');
  };

  const resetList = () => {
    setParticipants(ORIGINAL_PARTICIPANTS);
    setGroups([]);
    setGroupCount(4);
    setEditingIndex(null);
    showNotice('Daftar awal dikembalikan');
  };

  // Template Handlers
  const saveAsTemplate = () => {
    const name = templateNameInput.trim();
    if (!name) return;
    if (!participants.length) {
      showNotice('Daftar nama kosong');
      return;
    }
    setTemplates(prev => [...prev, { name, list: [...participants] }]);
    setTemplateNameInput('');
    showNotice(`Template "${name}" disimpan`);
  };

  const loadTemplate = (list) => {
    setParticipants([...list]);
    setGroups([]);
    showNotice('Template dimuat');
  };

  const deleteTemplate = (index) => {
    setTemplates(prev => prev.filter((_, i) => i !== index));
    showNotice('Template dihapus');
  };

  // Spin Wheel Logic
  const startSpin = () => {
    if (spinning || participants.length < 2) return;
    setSpinning(true);
    setSelectedWinner(null);

    const randomIndex = Math.floor(Math.random() * participants.length);
    const sliceAngle = 360 / participants.length;
    // Putar beberapa putaran penuh + posisi nama acak
    const extraTurns = 5 * 360;
    const targetDegree = wheelRotation + extraTurns + (360 - (randomIndex * sliceAngle) - (sliceAngle / 2));
    
    setWheelRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setSelectedWinner(participants[randomIndex]);
      showNotice(`Terpilih: ${participants[randomIndex]}!`);
    }, 3500);
  };

  const copyGroups = async () => {
    if (!groups.length) return;
    const text = groups.map((group) => `KELOMPOK ${group.id + 1}\n${group.names.map((name) => `• ${name}`).join('\n')}`).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showNotice('Kelompok disalin ke clipboard');
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      showNotice('Clipboard tidak dapat diakses');
    }
  };

  const updateGroupCount = (next) => {
    const maxForRoom = Math.max(2, participants.length);
    const safeCount = Math.max(2, Math.min(maxForRoom, next));
    setGroupCount(safeCount);
    setGroups([]);
  };

  return (
    <main className="app-shell">
      <div className="ambient-orb ambient-orb-one" />
      <div className="ambient-orb ambient-orb-two" />

      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">
            <span /><span /><span />
          </div>
          <span>Arunika<span className="brand-light">Mix</span></span>
        </div>
        <div className="header-note">
          <span className="pulse-dot" />
          kelompok adil, energi baru
        </div>
      </header>

      <section className="hero-wrap">
        <div className="hero-copy">
          <div className="eyebrow">
            <Icon name="sparkles" size={14} />
            PEMBAGI KELOMPOK ACAK
          </div>
          <h1>Beri ruang<br /><em>untuk kejutan.</em></h1>
          <p>Ubah kerumunan menjadi tim-tim kecil yang seimbang — tanpa repot menghitung, memilih, atau berdebat.</p>
        </div>

        <div className="hero-stamp">
          <span className="stamp-number">{participants.length}</span>
          <span className="stamp-caption">orang<br />di dalamnya</span>
          <div className="stamp-line" />
          <span className="stamp-caption">satu titik awal<br />yang adil</span>
        </div>
      </section>

      {/* ACTION BAR: SPIN WHEEL & BULK ADD */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <button type="button" className="copy-button" onClick={() => setShowSpinWheel(!showSpinWheel)}>
          <Icon name="disc" size={16} />
          {showSpinWheel ? 'Tutup Roda Putar' : 'Mode Roda Putar (Spin Wheel)'}
        </button>
        <button type="button" className="copy-button" onClick={() => setShowBulkModal(true)}>
          <Icon name="file-text" size={16} />
          Tempel Banyak Nama Sekaligus
        </button>
      </div>

      {/* SPIN WHEEL SECTION */}
      {showSpinWheel && (
        <section className="panel" style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div className="section-kicker" style={{ justifyContent: 'center' }}>
            <Icon name="disc" size={15} /> RODA PUTAR ACAK
          </div>
          <h2>Putar Roda Pembawa Keberuntungan</h2>
          <p className="panel-intro">Pilih 1 orang secara acak dari daftar peserta saat ini.</p>

          <div style={{ position: 'relative', width: '260px', height: '260px', margin: '20px auto' }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
              zIndex: 10, width: 0, height: 0,
              borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid var(--coral-deep)'
            }} />
            
            {/* Wheel Canvas / SVG */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--plum)',
              transform: `rotate(${wheelRotation}deg)`, transition: spinning ? 'transform 3.5s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              overflow: 'hidden', position: 'relative', background: 'var(--paper-light)'
            }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {participants.map((person, i) => {
                  const total = participants.length;
                  const angle = 360 / total;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  
                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const largeArc = angle > 180 ? 1 : 0;
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const colors = ['#ee806c', '#edb949', '#4c9382', '#4b334d', '#86abb4', '#d78b88', '#93b99d', '#ba8850'];

                  return (
                    <path key={i} d={pathData} fill={colors[i % colors.length]} opacity="0.85" />
                  );
                })}
              </svg>
            </div>
          </div>

          <button type="button" className="shuffle-button" onClick={startSpin} disabled={spinning || participants.length < 2} style={{ maxWidth: '280px', margin: '0 auto' }}>
            <Icon name="rotate-cw" size={18} className={spinning ? 'spin-icon' : ''} />
            {spinning ? 'Memutar...' : 'Putar Sekarang'}
          </button>

          {selectedWinner && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(76, 147, 130, 0.15)', borderRadius: '10px' }}>
              🎉 Selamat! Terpilih: <strong style={{ fontSize: '18px', color: 'var(--teal)' }}>{selectedWinner}</strong>
            </div>
          )}
        </section>
      )}

      {/* BULK TEXT MODAL */}
      {showBulkModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'grid', placeItems: 'center', padding: '15px'
        }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', background: 'var(--paper-light)' }}>
            <h3>Tempel Daftar Nama</h3>
            <p className="panel-intro">Masukkan/tempel banyak nama sekaligus (pisahkan tiap nama dengan baris baru):</p>
            <textarea
              rows={8}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', fontFamily: 'inherit' }}
              placeholder="Contoh:&#10;Agung Pranaja&#10;Aina Salsabil&#10;Ainul Mardhiah"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="copy-button" onClick={() => setShowBulkModal(false)}>Batal</button>
              <button type="button" className="add-button" style={{ flex: 'none', padding: '0 16px' }} onClick={handleBulkAdd}>Tambahkan Semua</button>
            </div>
          </div>
        </div>
      )}

      <section className="workspace">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">
                <Icon name="users" size={15} />
                PESERTA
              </div>
              <h2>Daftar peserta <span>({participants.length})</span></h2>
            </div>
            <button type="button" className="icon-button" onClick={resetList} title="Kembalikan ke daftar awal">
              <Icon name="rotate-ccw" size={16} />
            </button>
          </div>

          <p className="panel-intro">Tambahkan semua yang hadir. Kami akan menjaga jumlah setiap kelompok tetap seimbang.</p>

          <div className="add-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
              placeholder="Tambah nama peserta..."
            />
            <button type="button" className="add-button" onClick={addParticipant}>
              <Icon name="plus" size={18} />
            </button>
          </div>

          <div className="participant-list">
            {participants.length ? (
              participants.map((person, index) => (
                <div className="participant-row" key={`${person}-${index}`}>
                  {editingIndex === index ? (
                    <input
                      className="edit-input"
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(index);
                        if (e.key === 'Escape') setEditingIndex(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className="person-number">{String(index + 1).padStart(2, '0')}</span>
                      <span className="person-name">{person}</span>
                    </>
                  )}

                  <div className="row-actions">
                    {editingIndex === index ? (
                      <>
                        <button type="button" className="row-action" onClick={() => saveEdit(index)}>
                          <Icon name="check" size={14} />
                        </button>
                        <button type="button" className="row-action" onClick={() => setEditingIndex(null)}>
                          <Icon name="x" size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="row-action" onClick={() => { setEditingIndex(index); setEditingName(person); }}>
                          <Icon name="edit-3" size={14} />
                        </button>
                        <button type="button" className="row-action delete-action" onClick={() => removeParticipant(index)}>
                          <Icon name="trash-2" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-soft)' }}>
                Belum ada peserta. Tambahkan setidaknya dua orang.
              </div>
            )}
          </div>

          {/* TEMPLATES MANAGER */}
          <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
            <div className="section-kicker" style={{ marginBottom: '8px' }}>
              <Icon name="folder" size={12} /> TEMPLATE TERSIMPAN
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                className="edit-input"
                placeholder="Simpan daftar ini sebagai..."
                value={templateNameInput}
                onChange={(e) => setTemplateNameInput(e.target.value)}
              />
              <button type="button" className="copy-button" onClick={saveAsTemplate}>Simpan</button>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {templates.map((tpl, i) => (
                <span key={i} style={{ background: 'var(--line)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => loadTemplate(tpl.list)}>
                    {tpl.name} ({tpl.list.length})
                  </span>
                  {i > 0 && (
                    <Icon name="x" size={12} className="row-action delete-action" onClick={() => deleteTemplate(i)} />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-footer">
            <span>Daftar awal: {ORIGINAL_PARTICIPANTS.length} orang</span>
            <button type="button" className="text-button" onClick={resetList}>
              kembalikan daftar <Icon name="arrow-right" size={14} />
            </button>
          </div>
        </div>

        <div className="mix-panel">
          <div className="mix-topline">
            <div className="section-kicker">
              <Icon name="shuffle" size={15} /> ACAK
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--line)', padding: '2px 6px', borderRadius: '4px' }}>
              {groups.length ? 'SUDAH DIACAK' : 'SIAP DIACAK'}
            </span>
          </div>

          <h2>Berapa kelompok?</h2>
          <p className="mix-description">Pilih jumlahnya, lalu biarkan keberuntungan menentukan perkenalannya.</p>

          <div className="group-picker">
            <button type="button" className="picker-button" onClick={() => updateGroupCount(effectiveGroupCount - 1)} disabled={effectiveGroupCount <= 2}>
              <Icon name="minus" size={18} />
            </button>
            <div className="group-count">
              <strong>{effectiveGroupCount}</strong>
              <span>kelompok</span>
            </div>
            <button type="button" className="picker-button" onClick={() => updateGroupCount(effectiveGroupCount + 1)} disabled={effectiveGroupCount >= Math.max(2, participants.length)}>
              <Icon name="plus" size={18} />
            </button>
          </div>

          <div className="balance-note">
            <span className="balance-mark">≈</span>
            <span>{groupSizeLabel}</span>
            <span className="balance-divider" />
            <span>{participants.length ? 'seimbang berdasarkan jumlah' : 'menunggu nama peserta'}</span>
          </div>

          <button type="button" className="shuffle-button" onClick={shuffleGroups} disabled={isShuffling || participants.length < 2}>
            <Icon name="shuffle" size={18} className={isShuffling ? 'spin-icon' : ''} />
            {isShuffling ? 'Sedang mengacak...' : groups.length ? 'Acak lagi' : 'Acak kelompok'}
            <Icon name="arrow-right" size={18} />
          </button>

          {/* RIWAYAT ACAKAN (HISTORY) */}
          {history.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--line)' }}>
              <div className="section-kicker" style={{ marginBottom: '8px' }}>
                <Icon name="clock" size={12} /> RIWAYAT ACAKAN
              </div>
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setGroups(item.data)}
                    style={{
                      padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.03)',
                      marginBottom: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', justifyContent: 'space-between'
                    }}
                  >
                    <span>Acakan {item.data.length} Kelompok</span>
                    <span style={{ color: 'var(--ink-soft)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mix-hint">
            <span>Setiap acakan bersifat acak.</span>
            <span>Setiap kelompok seimbang.</span>
          </div>
        </div>
      </section>

      <section className="results-section">
        <div className="results-heading">
          <div>
            <div className="section-kicker">HASIL ACAKAN</div>
            <h2>Kelompokmu <span>{groups.length ? `· ${groups.length}` : ''}</span></h2>
          </div>

          <button type="button" className="copy-button" onClick={copyGroups} disabled={!groups.length}>
            <Icon name={copied ? "check" : "clipboard"} size={16} />
            {copied ? 'Tersalin' : 'Salin kelompok'}
          </button>
        </div>

        {groups.length ? (
          <div className="groups-grid">
            {groups.map((group) => (
              <article className={`group-card group-${GROUP_COLORS[group.id % GROUP_COLORS.length]}`} key={group.id}>
                <div className="group-card-head">
                  <span className="group-label">KELOMPOK</span>
                  <span className="group-number">{String(group.id + 1).padStart(2, '0')}</span>
                  <span className="group-total">{group.names.length} orang</span>
                </div>
                <div className="group-names">
                  {group.names.map((name, index) => (
                    <div className="group-person" key={`${name}-${index}`}>
                      <span className="member-dot" />
                      {name}
                    </div>
                  ))}
                </div>
                <div className="group-card-foot">
                  <span>acakan seimbang</span>
                  <span>~</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="result-empty">
            <div className="empty-sun">
              <Icon name="shuffle" size={24} />
            </div>
            <h3>Belum ada hasil acakan.</h3>
            <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>Pembagian kelompok baru akan muncul di sini dan mudah dibagikan.</p>
            <button type="button" className="empty-cta" onClick={shuffleGroups} disabled={participants.length < 2}>
              Acak sekarang <Icon name="arrow-right" size={16} />
            </button>
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span>ArunikaMix • alat kecil untuk menyatukan orang</span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>LOKAL SAJA / TANPA LOGIN</span>
      </footer>

      {notice && <div className="toast-notice">{notice}</div>}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Home />);
