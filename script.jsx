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
  'Zaim Andrias Adhimukti', 'Zakiyah Khoirunnisa',
];

const GROUP_COLORS = ['coral', 'saffron', 'teal', 'plum', 'sky', 'rose', 'mint', 'ochre'];

// Helper Ikon Lucide untuk React di CDN
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
    names: shuffled.filter((_, personIndex) => personIndex % count === index),
  }));
}

function Home() {
  const [participants, setParticipants] = useState(ORIGINAL_PARTICIPANTS);
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

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
      setGroups(createGroups(participants, effectiveGroupCount));
      setIsShuffling(false);
      showNotice(groups.length ? 'Acakan baru siap' : 'Kelompok siap');
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

// Render Aplikasi React ke DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Home />);

