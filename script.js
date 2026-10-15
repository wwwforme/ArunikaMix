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
  return React.createElement('span', { ref, style: { display: 'inline-flex', alignItems: 'center' } });
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
  const [inputBoxText, setInputBoxText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const [history, setHistory] = useState([]);
  
  // Ambil template tersimpan dari localStorage agar tidak hilang saat browser ditutup
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('arunikamix_templates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [{ name: 'Daftar Awal', list: ORIGINAL_PARTICIPANTS }];
  });

  const [templateNameInput, setTemplateNameInput] = useState('');
  const [activeTab, setActiveTab] = useState('groups');

  // Spin Wheel State
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [removeWinnerOnSelect, setRemoveWinnerOnSelect] = useState(false);

  const [duels, setDuels] = useState([]);
  const [queueList, setQueueList] = useState([]);

  const noticeTimer = useRef(null);
  const effectiveGroupCount = Math.min(Math.max(2, groupCount), Math.max(2, participants.length));

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

  const makeDuels = () => {
    if (participants.length < 2) return;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      } else {
        pairs[pairs.length - 1].push(shuffled[i]);
      }
    }
    setDuels(pairs);
    showNotice('Pasangan duel dibentuk!');
  };

  const makeQueue = () => {
    if (!participants.length) return;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    setQueueList(shuffled);
    showNotice('Urutan giliran diacak!');
  };

  // Simpan Template ke LocalStorage agar permanen
  const saveAsTemplate = () => {
    const name = templateNameInput.trim();
    if (!name) return;
    if (!participants.length) {
      showNotice('Daftar nama kosong');
      return;
    }
    const updatedTemplates = [...templates, { name, list: [...participants] }];
    setTemplates(updatedTemplates);
    localStorage.setItem('arunikamix_templates', JSON.stringify(updatedTemplates));
    setTemplateNameInput('');
    showNotice(`Template "${name}" disimpan permanen`);
  };

  const loadTemplate = (list) => {
    setParticipants([...list]);
    setGroups([]);
    showNotice('Template dimuat');
  };

  const deleteTemplate = (index) => {
    const updatedTemplates = templates.filter((_, i) => i !== index);
    setTemplates(updatedTemplates);
    localStorage.setItem('arunikamix_templates', JSON.stringify(updatedTemplates));
    showNotice('Template dihapus');
  };

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
      const winner = participants[randomIndex];
      setSelectedWinner(winner);

      // Jika opsi hapus pemenang dicentang, hapus namanya dari daftar utama
      if (removeWinnerOnSelect) {
        setParticipants(current => current.filter((_, i) => i !== randomIndex));
        showNotice(`Pemenang ${winner} terpilih dan dihapus dari daftar!`);
      } else {
        showNotice(`Terpilih: ${winner}!`);
      }
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

  return React.createElement('main', { className: 'app-shell' },
    React.createElement('div', { className: 'ambient-orb ambient-orb-one' }),
    React.createElement('div', { className: 'ambient-orb ambient-orb-two' }),

    React.createElement('header', { className: 'site-header' },
      React.createElement('div', { className: 'brand-lockup' },
        React.createElement('div', { className: 'brand-mark' },
          React.createElement('span'), React.createElement('span'), React.createElement('span')
        ),
        React.createElement('span', null, 'Arunika', React.createElement('span', { className: 'brand-light' }, 'Mix'))
      ),
      React.createElement('div', { className: 'header-note' },
        React.createElement('span', { className: 'pulse-dot' }),
        'kelompok adil, energi baru'
      )
    ),

    React.createElement('section', { className: 'hero-wrap' },
      React.createElement('div', { className: 'hero-copy' },
        React.createElement('div', { className: 'eyebrow' },
          React.createElement(Icon, { name: 'sparkles', size: 14 }),
          'PEMBAGI KELOMPOK ACAK & MINI GAMES'
        ),
        React.createElement('h1', null, 'Beri ruang', React.createElement('br'), React.createElement('em', null, 'untuk kejutan.')),
        React.createElement('p', null, 'Ubah kerumunan menjadi tim-tim kecil atau undian seru secara adil tanpa repot.')
      ),
      React.createElement('div', { className: 'hero-stamp' },
        React.createElement('span', { className: 'stamp-number' }, participants.length),
        React.createElement('span', { className: 'stamp-caption' }, 'orang', React.createElement('br'), 'di dalamnya'),
        React.createElement('div', { className: 'stamp-line' }),
        React.createElement('span', { className: 'stamp-caption' }, 'satu titik awal', React.createElement('br'), 'yang adil')
      )
    ),

    React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' } },
      React.createElement('button', { type: 'button', className: 'copy-button', onClick: () => setActiveTab('groups'), style: { background: activeTab === 'groups' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'groups' ? '#fff' : 'var(--ink)' } },
        React.createElement(Icon, { name: 'users', size: 16 }), ' Pembagi Kelompok'
      ),
      React.createElement('button', { type: 'button', className: 'copy-button', onClick: () => setActiveTab('wheel'), style: { background: activeTab === 'wheel' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'wheel' ? '#fff' : 'var(--ink)' } },
        React.createElement(Icon, { name: 'disc', size: 16 }), ' Roda Putar (Spin Wheel)'
      ),
      React.createElement('button', { type: 'button', className: 'copy-button', onClick: () => setActiveTab('duel'), style: { background: activeTab === 'duel' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'duel' ? '#fff' : 'var(--ink)' } },
        React.createElement(Icon, { name: 'git-pull-request', size: 16 }), ' Undian Berpasangan (Duel)'
      ),
      React.createElement('button', { type: 'button', className: 'copy-button', onClick: () => setActiveTab('queue'), style: { background: activeTab === 'queue' ? 'var(--plum)' : 'var(--paper-light)', color: activeTab === 'queue' ? '#fff' : 'var(--ink)' } },
        React.createElement(Icon, { name: 'list-ordered', size: 16 }), ' Urutan Antrean / Giliran'
      )
    ),

    React.createElement('div', { className: 'workspace' },
      React.createElement('div', { className: 'panel' },
        React.createElement('div', { className: 'panel-heading' },
          React.createElement('div', null,
            React.createElement('div', { className: 'section-kicker' },
              React.createElement(Icon, { name: 'users', size: 15 }), ' PESERTA'
            ),
            React.createElement('h2', null, 'Daftar peserta ', React.createElement('span', null, `(${participants.length})`))
          ),
          React.createElement('div', { style: { display: 'flex', gap: '4px' } },
            React.createElement('button', { type: 'button', className: 'icon-button delete-action', onClick: clearAllParticipants, title: 'Hapus Semua Nama' },
              React.createElement(Icon, { name: 'trash-2', size: 16 })
            ),
            React.createElement('button', { type: 'button', className: 'icon-button', onClick: resetList, title: 'Kembalikan ke daftar awal' },
              React.createElement(Icon, { name: 'rotate-ccw', size: 16 })
            )
          )
        ),
        React.createElement('p', { className: 'panel-intro' }, 'Ketik satu nama atau tempel daftar nama panjang sekaligus di bawah ini (baris baru otomatis jadi nama terpisah).'),
        React.createElement('div', { style: { marginBottom: '14px' } },
          React.createElement('textarea', {
            rows: 3,
            value: inputBoxText,
            onChange: (e) => setInputBoxText(e.target.value),
            placeholder: 'Ketik atau tempel daftar nama di sini...',
            style: { width: '100%', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', background: 'rgba(246, 240, 228, 0.68)', color: 'var(--ink)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }
          }),
          React.createElement('button', { type: 'button', className: 'shuffle-button', onClick: handleAddNames, style: { marginTop: '8px', padding: '10px', fontSize: '13px' } },
            React.createElement(Icon, { name: 'plus', size: 16 }), ' Tambahkan ke Daftar'
          )
        ),
        React.createElement('div', { className: 'participant-list' },
          participants.length ? participants.map((person, index) =>
            React.createElement('div', { className: 'participant-row', key: `${person}-${index}` },
              editingIndex === index ?
                React.createElement('input', {
                  className: 'edit-input',
                  autoFocus: true,
                  value: editingName,
                  onChange: (e) => setEditingName(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') saveEdit(index);
                    if (e.key === 'Escape') setEditingIndex(null);
                  }
                }) :
                React.createElement(React.Fragment, null,
                  React.createElement('span', { className: 'person-number' }, String(index + 1).padStart(2, '0')),
                  React.createElement('span', { className: 'person-name' }, person)
                ),
              React.createElement('div', { className: 'row-actions' },
                editingIndex === index ?
                  React.createElement(React.Fragment, null,
                    React.createElement('button', { type: 'button', className: 'row-action', onClick: () => saveEdit(index) }, React.createElement(Icon, { name: 'check', size: 14 })),
                    React.createElement('button', { type: 'button', className: 'row-action', onClick: () => setEditingIndex(null) }, React.createElement(Icon, { name: 'x', size: 14 }))
                  ) :
                  React.createElement(React.Fragment, null,
                    React.createElement('button', { type: 'button', className: 'row-action', onClick: () => { setEditingIndex(index); setEditingName(person); } }, React.createElement(Icon, { name: 'edit-3', size: 14 })),
                    React.createElement('button', { type: 'button', className: 'row-action delete-action', onClick: () => removeParticipant(index) }, React.createElement(Icon, { name: 'trash-2', size: 14 }))
                  )
              )
            )
          ) : React.createElement('div', { style: { textAlign: 'center', padding: '20px', color: 'var(--ink-soft)' } }, 'Belum ada peserta. Masukkan nama di atas.')
        ),
        React.createElement('div', { style: { marginTop: '15px', paddingTop: '12px', borderTop: '1px solid var(--line)' } },
          React.createElement('div', { className: 'section-kicker', style: { marginBottom: '8px' } },
            React.createElement(Icon, { name: 'folder', size: 12 }), ' TEMPLATE TERSIMPAN (PERMANEN)'
          ),
          React.createElement('div', { style: { display: 'flex', gap: '6px', marginBottom: '8px' } },
            React.createElement('input', {
              className: 'edit-input',
              placeholder: 'Nama template baru...',
              value: templateNameInput,
              onChange: (e) => setTemplateNameInput(e.target.value)
            }),
            React.createElement('button', { type: 'button', className: 'copy-button', onClick: saveAsTemplate }, 'Simpan')
          ),
          React.createElement('div', { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
            templates.map((tpl, i) =>
              React.createElement('span', { key: i, style: { background: 'var(--line)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' } },
                React.createElement('span', { style: { cursor: 'pointer', fontWeight: 'bold' }, onClick: () => loadTemplate(tpl.list) }, `${tpl.name} (${tpl.list.length})`),
                i > 0 && React.createElement(Icon, { name: 'x', size: 12, className: 'row-action delete-action', onClick: () => deleteTemplate(i) })
              )
            )
          )
        )
      ),

      React.createElement('div', { className: 'mix-panel' },
        activeTab === 'groups' && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'mix-topline' },
            React.createElement('div', { className: 'section-kicker' }, React.createElement(Icon, { name: 'shuffle', size: 15 }), ' PEMBAGI KELOMPOK'),
            React.createElement('span', { style: { fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--line)', padding: '2px 6px', borderRadius: '4px' } }, groups.length ? 'SUDAH DIACAK' : 'SIAP')
          ),
          React.createElement('h2', null, 'Berapa kelompok?'),
          React.createElement('p', { className: 'mix-description' }, 'Ketik langsung jumlah kelompok yang diinginkan, lalu acak secara merata.'),
          React.createElement('div', { style: { margin: '15px 0' } },
            React.createElement('label', { style: { fontSize: '12px', color: 'var(--ink-soft)', display: 'block', marginBottom: '6px' } }, 'Jumlah Kelompok:'),
            React.createElement('input', {
              type: 'number',
              min: '2',
              max: Math.max(2, participants.length),
              value: groupCount,
              onChange: (e) => {
                const val = parseInt(e.target.value) || 2;
                setGroupCount(val);
                setGroups([]);
              },
              style: { width: '100%', padding: '12px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', background: 'rgba(246, 240, 228, 0.68)', border: '1px solid var(--line)', borderRadius: '12px', color: 'var(--ink)', fontFamily: 'var(--font-display)' }
            })
          ),
          React.createElement('div', { className: 'balance-note' },
            React.createElement('span', { className: 'balance-mark' }, '≈'),
            React.createElement('span', null, groupSizeLabel),
            React.createElement('span', { className: 'balance-divider' }),
            React.createElement('span', null, participants.length ? 'seimbang' : 'kosong')
          ),
          React.createElement('button', { type: 'button', className: 'shuffle-button', onClick: shuffleGroups, disabled: isShuffling || participants.length < 2 },
            React.createElement(Icon, { name: 'shuffle', size: 18, className: isShuffling ? 'spin-icon' : '' }),
            isShuffling ? 'Mengacak...' : groups.length ? 'Acak Lagi' : 'Acak Kelompok',
            React.createElement(Icon, { name: 'arrow-right', size: 18 })
          ),
          history.length > 0 && React.createElement('div', { style: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--line)' } },
            React.createElement('div', { className: 'section-kicker', style: { marginBottom: '8px' } }, React.createElement(Icon, { name: 'clock', size: 12 }), ' RIWAYAT ACAKAN'),
            React.createElement('div', { style: { maxHeight: '110px', overflowY: 'auto' } },
              history.map((item) =>
                React.createElement('div', { key: item.id, onClick: () => setGroups(item.data), style: { padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.03)', marginBottom: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', justifyContent: 'space-between' } },
                  React.createElement('span', null, `Acakan ${item.data.length} Kelompok`),
                  React.createElement('span', { style: { color: 'var(--ink-soft)' } }, item.time)
                )
              )
            )
          )
        ),

        activeTab === 'wheel' && React.createElement('div', { style: { textAlign: 'center' } },
          React.createElement('div', { className: 'section-kicker', style: { justifyContent: 'center' } }, React.createElement(Icon, { name: 'disc', size: 15 }), ' RODA PUTAR'),
          React.createElement('h2', null, 'Putar Roda Undian'),
          React.createElement('p', { className: 'mix-description' }, 'Pilih apakah nama pemenang otomatis dihapus atau tetap di daftar.'),
          
          /* Checkbox Hapus Nama Pemenang */
          React.createElement('div', { style: { margin: '10px 0', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--ink-soft)' } },
            React.createElement('input', {
              type: 'checkbox',
              id: 'removeWinner',
              checked: removeWinnerOnSelect,
              onChange: (e) => setRemoveWinnerOnSelect(e.target.checked)
            }),
            React.createElement('label', { htmlFor: 'removeWinner', style: { cursor: 'pointer' } }, 'Hapus nama dari daftar setelah terpilih')
          ),

          React.createElement('div', { style: { position: 'relative', width: '220px', height: '220px', margin: '10px auto' } },
            React.createElement('div', { style: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '18px solid var(--coral-deep)' } }),
            React.createElement('div', { style: { width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--plum)', transform: `rotate(${wheelRotation}deg)`, transition: spinning ? 'transform 3.8s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'none', overflow: 'hidden', position: 'relative', background: 'var(--paper-light)', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' } },
              React.createElement('svg', { viewBox: '0 0 100 100', style: { width: '100%', height: '100%' } },
                participants.map((person, i) => {
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
                  return React.createElement('path', { key: i, d: pathData, fill: colors[i % colors.length], stroke: '#fff', strokeWidth: '0.5' });
                })
              )
            )
          ),
          React.createElement('button', { type: 'button', className: 'shuffle-button', onClick: startSpin, disabled: spinning || participants.length < 2 },
            React.createElement(Icon, { name: 'rotate-cw', size: 18, className: spinning ? 'spin-icon' : '' }),
            spinning ? 'Berputar...' : 'Putar Roda'
          ),
          selectedWinner && React.createElement('div', { style: { marginTop: '14px', padding: '10px', background: 'rgba(76, 147, 130, 0.15)', borderRadius: '8px', fontSize: '13px' } },
            '🎉 Pemenang: ', React.createElement('strong', { style: { color: 'var(--teal)' } }, selectedWinner)
          )
        ),

        activeTab === 'duel' && React.createElement('div', null,
          React.createElement('div', { className: 'section-kicker' }, React.createElement(Icon, { name: 'git-pull-request', size: 15 }), ' UNDIAN BERPASANGAN'),
          React.createElement('h2', null, 'Pasangan Duel / Tim 2 Orang'),
          React.createElement('p', { className: 'mix-description' }, 'Cocokkan peserta menjadi pasangan tanding atau partner kerja.'),
          React.createElement('button', { type: 'button', className: 'shuffle-button', onClick: makeDuels, disabled: participants.length < 2 },
            React.createElement(Icon, { name: 'shuffle', size: 18 }), ' Acak Pasangan Sekarang'
          ),
          duels.length > 0 && React.createElement('div', { style: { marginTop: '15px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' } },
            duels.map((pair, idx) =>
              React.createElement('div', { key: idx, style: { padding: '10px', background: 'var(--paper-light)', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement('span', { style: { fontWeight: 'bold', color: 'var(--coral-deep)' } }, `Pasangan #${idx + 1}`),
                React.createElement('span', null, pair.join(' vs '))
              )
            )
          )
        ),

        activeTab === 'queue' && React.createElement('div', null,
          React.createElement('div', { className: 'section-kicker' }, React.createElement(Icon, { name: 'list-ordered', size: 15 }), ' URUTAN ANTREAN'),
          React.createElement('h2', null, 'Nomor Giliran / Presentasi'),
          React.createElement('p', { className: 'mix-description' }, 'Acak siapa yang tampil duluan hingga terakhir secara adil.'),
          React.createElement('button', { type: 'button', className: 'shuffle-button', onClick: makeQueue, disabled: !participants.length },
            React.createElement(Icon, { name: 'shuffle', size: 18 }), ' Acak Urutan Giliran'
          ),
          queueList.length > 0 && React.createElement('div', { style: { marginTop: '15px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' } },
            queueList.map((name, idx) =>
              React.createElement('div', { key: idx, style: { padding: '8px 12px', background: 'var(--paper-light)', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' } },
                React.createElement('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--coral)' } }, `#${String(idx + 1).padStart(2, '0')}`),
                React.createElement('span', null, name)
              )
            )
          )
        )
      )
    ),

    activeTab === 'groups' && React.createElement('section', { className: 'results-section' },
      React.createElement('div', { className: 'results-heading' },
        React.createElement('div', null,
          React.createElement('div', { className: 'section-kicker' }, 'HASIL ACAKAN'),
          React.createElement('h2', null, 'Kelompokmu ', React.createElement('span', null, groups.length ? `· ${groups.length}` : ''))
        ),
        React.createElement('button', { type: 'button', className: 'copy-button', onClick: copyGroups, disabled: !groups.length },
          React.createElement(Icon, { name: copied ? 'check' : 'clipboard', size: 16 }),
          copied ? 'Tersalin' : 'Salin Kelompok'
        )
      ),
      groups.length ? React.createElement('div', { className: 'groups-grid' },
        groups.map((group) =>
          React.createElement('article', { className: `group-card group-${GROUP_COLORS[group.id % GROUP_COLORS.length]}`, key: group.id },
            React.createElement('div', { className: 'group-card-head' },
              React.createElement('span', { className: 'group-label' }, 'KELOMPOK'),
              React.createElement('span', { className: 'group-number' }, String(group.id + 1).padStart(2, '0')),
              React.createElement('span', { className: 'group-total' }, `${group.names.length} orang`)
            ),
            React.createElement('div', { className: 'group-names' },
              group.names.map((name, index) =>
                React.createElement('div', { className: 'group-person', key: `${name}-${index}` },
                  React.createElement('span', { className: 'member-dot' }),
                  name
                )
              )
            )
          )
        )
      ) : React.createElement('div', { className: 'result-empty' },
        React.createElement('div', { className: 'empty-sun' }, React.createElement(Icon, { name: 'shuffle', size: 24 })),
        React.createElement('h3', null, 'Belum ada hasil acakan kelompok.'),
        React.createElement('p', { style: { color: 'var(--ink-soft)', fontSize: '13px' } }, 'Tentukan jumlah kelompok di atas lalu klik acak.')
      )
    ),

    React.createElement('footer', { className: 'site-footer' },
      React.createElement('span', null, 'ArunikaMix • alat kecil untuk menyatukan orang'),
      React.createElement('span', { style: { fontFamily: 'var(--font-mono)' } }, 'LOKAL SAJA / TANPA LOGIN')
    ),

    notice && React.createElement('div', { className: 'toast-notice' }, notice)
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Home));
