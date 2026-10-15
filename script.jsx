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
  const [inputBoxText, setInputBoxText] = useState(''); // Mendukung input per baris / paste masal
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  // Fitur Tambahan: History, Spin Wheel, Mode Seru Lainnya
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([
    { name: 'Daftar Awal', list: ORIGINAL_PARTICIPANTS }
  ]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  
  // Fitur Mode Interaktif Lainnya ('groups' | 'wheel' | 'duel' | 'queue')
  const [activeTab, setActiveTab] = useState('groups');

  // Spin Wheel State
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Mode Duel / Berpasangan State
  const [duels, setDuels] = useState([]);

  // Mode Urutan Antrean / Giliran State
  const [queueList, setQueueList] = useState([]);

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

  // Handler Input Nama (Bisa ketik satu atau paste banyak nama sekaligus per baris)
  const handleAddNames = () => {
    const text = inputBoxText.trim();
    if (!text) return;

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const existing = new Set(participants.map(p => p.toLowerCase()));
    const added = [];

    lines.forEach(name => {
      if (!existing.has(name.toLowerCase())) {
        added.push(name);
        existing.add(name.toLowerCase());
      }
    });

    if (added.length === 0) {
      showNotice('Nama tersebut sudah ada di daftar');
    } else {
      setParticipants(prev => [...prev, ...added]);
      setInputBoxText('');
      setGroups([]);
      showNotice(`${added.length} nama berhasil ditambahkan`);
    }
  };

  const removeParticipant = (index) => {
    const person = participants[index];
    setParticipants((current) => current.filter((_, personIndex) => personIndex !== index));
    setGroups([]);
    showNotice(`${person} dihapus`);
  };

  const clearAllParticipants = () => {
    if (window.confirm('Hapus seluruh daftar peserta?')) {
      setParticipants([]);
      setGroups([]);
      setDuels([]);
      setQueueList([]);
      showNotice('Semua nama dihapus');
    }
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
    setDuels([]);
    setQueueList([]);
    setGroupCount(4);
    setEditingIndex(null);
    showNotice('Daftar awal dikembalikan');
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

      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [{ id: Date.now(), time: timeString, data: generated }, ...prev]);
    }, 420);
  };

  // Fitur Tambahan 4: Pengacak Duel / Berpasangan
  const makeDuels = () => {
    if (participants.length < 2) return;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      } else {
        // Sisa ganjil digabung ke pasangan terakhir
        pairs[pairs.length - 1].push(shuffled[i]);
      }
    }
    setDuels(pairs);
    showNotice('Pasangan duel dibentuk!');
  };

  // Fitur Tambahan 4: Pengacak Urutan / Antrean Giliran
  const makeQueue = () => {
    if (!participants.length) return;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    setQueueList(shuffled);
    showNotice('Urutan giliran diacak!');
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

  // Spin Wheel Logic (Dengan Nama Tercantum di Roda)
  const startSpin = () => {
    if (spinning || participants.length < 2) return;
    setSpinning(true);
    setSelectedWinner(null);

    const randomIndex = Math.floor(Math.random() * participants.length);
    const sliceAngle = 360 / participants.length;
    const extraTurns = 6 * 360;
    const targetDegree = wheelRotation + extraTurns + (360 - (randomIndex * sliceAngle) - (sliceAngle / 2));
    
    setWheelRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setSelectedWinner(participants[randomIndex]);
      showNotice(`Terpilih: ${participants[randomIndex]}!`);
    }, 3800);
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
            PEMBAGI KELOMPOK ACAK & MINI GAMES
          </div>
          <h1>Beri ruang<br /><em>untuk kejutan.</em></h1>
          <p>Ubah kerumunan menjadi tim-tim kecil atau undian seru secara adil tanpa repot.</p>
        </div>

        <div className="hero-stamp">
          <span className="stamp-number">{participants.length}</span>
          <span className="stamp-caption">orang<br />di dalamnya</span>
          <div className="stamp-line" />
          <span className="stamp-caption">satu titik awal<br />yang adil</span>
        </div>
      </section>

      {/* NAVIGASI MODE FITUR */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button type="button" className={`copy-button ${activeTab === 'groups' ? 'active-tab' : ''}`} onClick={() => setActiveTab('groups')} style={{ background: activeTab === 'groups' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'groups' ? '#fff' : 'var(--ink)' }}>
          <Icon name="users" size={16} /> Pembagi Kelompok
        </button>
        <button type="button" className={`copy-button ${activeTab === 'wheel' ? 'active-tab' : ''}`} onClick={() => setActiveTab('wheel')} style={{ background: activeTab === 'wheel' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'wheel' ? '#fff' : 'var(--ink)' }}>
          <Icon name="disc" size={16} /> Roda Putar (Spin Wheel)
        </button>
        <button type="button" className={`copy-button ${activeTab === 'duel' ? 'active-tab' : ''}`} onClick={() => setActiveTab('duel')} style={{ background: activeTab === 'duel' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'duel' ? '#fff' : 'var(--ink)' }}>
          <Icon name="git-pull-request" size={16} /> Undian Berpasangan (Duel)
        </button>
        <button type="button" className={`copy-button ${activeTab === 'queue' ? 'active-tab' : ''}`} onClick={() => setActiveTab('queue')} style={{ background: activeTab === 'queue' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'queue' ? '#fff' : 'var(--ink)' }}>
          <Icon name="list-ordered" size={16} /> Urutan Antrean / Giliran
        </button>
      </div>

      <div className="workspace">
        {/* KOLOM KIRI: DAFTAR PESERTA & INPUT NAMA */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">
                <Icon name="users" size={15} />
                PESERTA
              </div>
              <h2>Daftar peserta <span>({participants.length})</span></h2>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="button" className="icon-button delete-action" onClick={clearAllParticipants} title="Hapus Semua Nama">
                <Icon name="trash-2" size={16} />
              </button>
              <button type="button" className="icon-button" onClick={resetList} title="Kembalikan ke daftar awal">
                <Icon name="rotate-ccw" size={16} />
              </button>
            </div>
          </div>

          <p className="panel-intro">Ketik satu nama atau tempel (*paste*) daftar nama panjang sekaligus di bawah ini (baris baru otomatis jadi nama terpisah).</p>

          <div style={{ marginBottom: '14px' }}>
            <textarea
              rows={3}
              value={inputBoxText}
              onChange={(e) => setInputBoxText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddNames();
                }
              }}
              placeholder="Ketik atau tempel daftar nama di sini..."
              style={{
                width: '100%', border: '1px solid var(--line)', borderRadius: '8px',
                padding: '10px 12px', background: 'rgba(246, 240, 228, 0.68)', color: 'var(--ink)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical'
              }}
            />
            <button type="button" className="shuffle-button" onClick={handleAddNames} style={{ marginTop: '8px', padding: '10px', fontSize: '13px' }}>
              <Icon name="plus" size={16} /> Tambahkan ke Daftar
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
                Belum ada peserta. Masukkan nama di atas.
              </div>
            )}
          </div>

          {/* TEMPLATES MANAGER */}
          <div style={{ marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
            <div className="section-kicker" style={{ marginBottom: '8px' }}>
              <Icon name="folder" size={12} /> TEMPLATE LIST NAMA
            </div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                className="edit-input"
                placeholder="Nama template baru..."
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
        </div>

        {/* KOLOM KANAN: KONTROL BERDASARKAN TAB AKTIF */}
        <div className="mix-panel">
          {activeTab === 'groups' && (
            <>
              <div className="mix-topline">
                <div className="section-kicker"><Icon name="shuffle" size={15} /> PEMBAGI KELOMPOK</div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--line)', padding: '2px 6px', borderRadius: '4px' }}>
                  {groups.length ? 'SUDAH DIACAK' : 'SIAP'}
                </span>
              </div>

              <h2>Berapa kelompok?</h2>
              <p className="mix-description">Pilih jumlah kelompok yang diinginkan, lalu acak secara merata.</p>

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
                <span>{participants.length ? 'seimbang' : 'kosong'}</span>
              </div>

              <button type="button" className="shuffle-button" onClick={shuffleGroups} disabled={isShuffling || participants.length < 2}>
                <Icon name="shuffle" size={18} className={isShuffling ? 'spin-icon' : ''} />
                {isShuffling ? 'Mengacak...' : groups.length ? 'Acak Lagi' : 'Acak Kelompok'}
                <Icon name="arrow-right" size={18} />
              </button>

              {/* RIWAYAT */}
              {history.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--line)' }}>
                  <div className="section-kicker" style={{ marginBottom: '8px' }}><Icon name="clock" size={12} /> RIWAYAT ACAKAN</div>
                  <div style={{ maxHeight: '110px', overflowY: 'auto' }}>
                    {history.map((item) => (
                      <div key={item.id} onClick={() => setGroups(item.data)} style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.03)', marginBottom: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Acakan {item.data.length} Kelompok</span>
                        <span style={{ color: 'var(--ink-soft)' }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'wheel' && (
            <div style={{ textAlign: 'center' }}>
              <div className="section-kicker" style={{ justifyContent: 'center' }}><Icon name="disc" size={15} /> RODA PUTAR</div>
              <h2>Putar Nama Peserta</h2>
              <p className="mix-description">Nama tercantum di roda dan siap diundi.</p>

              <div style={{ position: 'relative', width: '240px', height: '240px', margin: '15px auto' }}>
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
                  width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '18px solid var(--coral-deep)'
                }} />
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--plum)',
                  transform: `rotate(${wheelRotation}deg)`, transition: spinning ? 'transform 3.8s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none',
                  overflow: 'hidden', position: 'relative', background: 'var(--paper-light)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
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

                      // Posisi teks di dalam slice roda
                      const midAngle = startAngle + angle / 2;
                      const textRadius = 32;
                      const tx = 50 + textRadius * Math.cos((Math.PI * (midAngle - 90)) / 180);
                      const ty = 50 + textRadius * Math.sin((Math.PI * (midAngle - 90)) / 180);

                      return (
                        <g key={i}>
                          <path d={pathData} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="0.5" />
                          <text x={tx} y={ty} fill="#fff" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${midAngle}, ${tx}, ${ty})`}>
                            {person.length > 10 ? person.substring(0, 9) + '..' : person}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <button type="button" className="shuffle-button" onClick={startSpin} disabled={spinning || participants.length < 2}>
                <Icon name="rotate-cw" size={18} className={spinning ? 'spin-icon' : ''} />
                {spinning ? 'Berputar...' : 'Putar Roda'}
              </button>

              {selectedWinner && (
                <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(76, 147, 130, 0.15)', borderRadius: '8px', fontSize: '13px' }}>
                  🎉 Pemenang: <strong style={{ color: 'var(--teal)' }}>{selectedWinner}</strong>
                </div>
              )}
            </div>
          )}

          {activeTab === 'duel' && (
            <div>
              <div className="section-kicker"><Icon name="git-pull-request" size={15} /> UNDIAN BERPASANGAN</div>
              <h2>Pasangan Duel / Tim 2 Orang</h2>
              <p className="mix-description">Cocokkan peserta menjadi pasangan tanding atau partner kerja.</p>

              <button type="button" className="shuffle-button" onClick={makeDuels} disabled={participants.length < 2}>
                <Icon name="shuffle" size={18} /> Acak Pasangan Sekarang
              </button>

              {duels.length > 0 && (
                <div style={{ marginTop: '15px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {duels.map((pair, idx) => (
                    <div key={idx} style={{ padding: '10px', background: 'var(--paper-light)', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--coral-deep)' }}>Pasangan #{idx + 1}</span>
                      <span>{pair.join(' vs ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'queue' && (
            <div>
              <div className="section-kicker"><Icon name="list-ordered" size={15} /> URUTAN ANTREAN</div>
              <h2>Nomor Giliran / Presentasi</h2>
              <p className="mix-description">Acak siapa yang tampil duluan hingga terakhir secara adil.</p>

              <button type="button" className="shuffle-button" onClick={makeQueue} disabled={!participants.length}>
                <Icon name="shuffle" size={18} /> Acak Urutan Giliran
              </button>

              {queueList.length > 0 && (
                <div style={{ marginTop: '15px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {queueList.map((name, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'var(--paper-light)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--coral)' }}>#{String(idx + 1).padStart(2, '0')}</span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HASIL KELOMPOK */}
      {activeTab === 'groups' && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <div className="section-kicker">HASIL ACAKAN</div>
              <h2>Kelompokmu <span>{groups.length ? `· ${groups.length}` : ''}</span></h2>
            </div>
            <button type="button" className="copy-button" onClick={copyGroups} disabled={!groups.length}>
              <Icon name={copied ? "check" : "clipboard"} size={16} />
              {copied ? 'Tersalin' : 'Salin Kelompok'}
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
                </article>
              ))}
            </div>
          ) : (
            <div className="result-empty">
              <div className="empty-sun"><Icon name="shuffle" size={24} /></div>
              <h3>Belum ada hasil acakan kelompok.</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>Pilih jumlah kelompok di atas lalu klik acak.</p>
            </div>
          )}
        </section>
      )}

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
