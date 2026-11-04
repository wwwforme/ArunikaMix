const { useState, useMemo, useRef, useEffect } = React;

/* =========================================================
   ARUNIKAMIX — KONFIGURASI SUPABASE
   ========================================================= */

const SUPABASE_URL = 'https://hldsxluraxvsxscjfbqf.supabase.co';

const SUPABASE_ANON_KEY =
   'sb_publishable_UHd_c11RvO2W814V17CbrA_v3WmdRF0';
const supabaseClient =
  window.supabase
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      )
    : null;


/* =========================================================
   DAFTAR PESERTA AWAL
   ========================================================= */

const ORIGINAL_PARTICIPANTS = [
  'Agung Pranaja',
  'Aina Salsabil',
  'Ainul Mardhiah',
  'Azfar Syahmi Al Akbar',
  'Fhyan Farikha Andi',
  'Iffanda Putri Vallendini',
  'Kansya Asqira Madhani Alam',
  'Khayla Eka Anugerah',
  'La Ode Abdul Raja Mananti',
  'La Ode Muhammad Syaban Hasnan',
  'Mahira Hasna Kamila Mustam',
  'Muh. Nur Alim',
  'Muhammad Fajar Ayyatullah An Nur',
  'Naizar Al Azmi K',
  'Nanda Saputri',
  'Nur Zahwa Syarifuddin',
  'Nurul Mutmainnah',
  'Oriza Putri Virany H.',
  'Raslan Syarsid',
  'Rasya Muhammad Athaya',
  'Sahlaa Zahidah Hawwaa M.',
  'Wa Ode Dini Dzakirah Lukman',
  'Wa Ode Kamalia Putri',
  'Wa Ode Ibnaty Nurul Aini S.',
  'Waldan Risallah Ampaeja',
  'Wa Ode Zalni Nining Pratiwi',
  'Zaim Andrias Adhimukti',
  'Zakiyah Khoirunnisa'
];

const GROUP_COLORS = [
  'coral',
  'saffron',
  'teal',
  'plum',
  'sky',
  'rose',
  'mint',
  'ochre'
];


/* =========================================================
   ICON COMPONENT
   ========================================================= */

const Icon = ({
  name,
  size = 16,
  className = ''
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML =
      `<i data-lucide="${name}" style="width:${size}px;height:${size}px;"></i>`;

    if (window.lucide) {
      window.lucide.createIcons({
        nameAttr: 'data-lucide'
      });

      const svg = ref.current.querySelector('svg');

      if (svg && className) {
        svg.setAttribute('class', className);
      }
    }
  }, [name, size, className]);

  return React.createElement(
    'span',
    {
      ref,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }
  );
};


/* =========================================================
   FUNGSI MEMBUAT KELOMPOK
   ========================================================= */

function createGroups(names, count) {
  const shuffled = [...names];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const swapIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      shuffled[index],
      shuffled[swapIndex]
    ] = [
      shuffled[swapIndex],
      shuffled[index]
    ];
  }

  return Array.from(
    { length: count },
    (_, index) => ({
      id: index,
      names: shuffled.filter(
        (_, personIndex) =>
          personIndex % count === index
      )
    })
  );
}


/* =========================================================
   HOME
   ========================================================= */

function Home() {

  /* -------------------------------------------------------
     PESERTA
     ------------------------------------------------------- */

  const [participants, setParticipants] =
    useState(ORIGINAL_PARTICIPANTS);

  const [groupCountInput, setGroupCountInput] =
    useState('4');

  const [groups, setGroups] =
    useState([]);

  const [inputBoxText, setInputBoxText] =
    useState('');

  const [editingIndex, setEditingIndex] =
    useState(null);

  const [editingName, setEditingName] =
    useState('');

  const [isShuffling, setIsShuffling] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const [notice, setNotice] =
    useState('');


  /* -------------------------------------------------------
     AUTH
     ------------------------------------------------------- */

  const [user, setUser] =
    useState(null);

  const [authEmail, setAuthEmail] =
    useState('');

  const [authPassword, setAuthPassword] =
    useState('');

  const [isSignUp, setIsSignUp] =
    useState(false);

  const [showAuthModal, setShowAuthModal] =
    useState(false);


  /* -------------------------------------------------------
     TEMPLATE & TAB
     ------------------------------------------------------- */

  const [history, setHistory] =
    useState([]);

  const [templates, setTemplates] =
    useState([
      {
        name: 'Arunika',
        list: ORIGINAL_PARTICIPANTS
      }
    ]);

  const [templateNameInput, setTemplateNameInput] =
    useState('');

  const [activeTab, setActiveTab] =
    useState('groups');


  /* -------------------------------------------------------
     WHEEL
     ------------------------------------------------------- */

  const [spinning, setSpinning] =
    useState(false);

  const [wheelRotation, setWheelRotation] =
    useState(0);

  const [selectedWinner, setSelectedWinner] =
    useState(null);

  const [removeWinnerOnSelect, setRemoveWinnerOnSelect] =
    useState(false);


  /* -------------------------------------------------------
     DUEL & QUEUE
     ------------------------------------------------------- */

  const [duels, setDuels] =
    useState([]);

  const [queueList, setQueueList] =
    useState([]);


  /* -------------------------------------------------------
     NOTICE TIMER
     ------------------------------------------------------- */

  const noticeTimer =
    useRef(null);


  /* =======================================================
     AUTH STATE
     ======================================================= */

  useEffect(() => {

    if (!supabaseClient) return;

    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => {

        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserTemplates(session.user.id);
        }

      });


    const {
      data: { subscription }
    } =
      supabaseClient.auth.onAuthStateChange(
        (_event, session) => {

          setUser(session?.user ?? null);

          if (session?.user) {

            fetchUserTemplates(
              session.user.id
            );

          } else {

            setTemplates([
              {
                name: 'Arunika',
                list: ORIGINAL_PARTICIPANTS
              }
            ]);

          }

        }
      );


    return () =>
      subscription.unsubscribe();

  }, []);


  /* =======================================================
     AMBIL TEMPLATE USER
     ======================================================= */

  const fetchUserTemplates = async (userId) => {

    if (!supabaseClient) return;

    const {
      data,
      error
    } =
      await supabaseClient
        .from('templates')
        .select('*')
        .eq('user_id', userId);

    if (!error && data) {

      const cloudTemplates =
        data.map((item) => ({
          id: item.id,
          name: item.name,
          list: item.list
        }));

      setTemplates([
        {
          name: 'Arunika',
          list: ORIGINAL_PARTICIPANTS
        },
        ...cloudTemplates
      ]);

    }

  };


  /* =======================================================
     NOTIFICATION
     ======================================================= */

  const showNotice = (message) => {

    setNotice(message);

    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }

    noticeTimer.current =
      window.setTimeout(
        () => setNotice(''),
        2800
      );

  };


  /* =======================================================
     LOGIN / REGISTER
     ======================================================= */

  const handleAuth = async (e) => {

    e.preventDefault();

    if (!supabaseClient) {
      showNotice('Supabase tidak tersedia.');
      return;
    }


    /* ---------------- REGISTER ---------------- */

    if (isSignUp) {

      /*
       * Redirect diarahkan langsung ke
       * GitHub Pages ArunikaMix.
       */

      const redirectUrl =
        window.location.origin +
        window.location.pathname;


      const {
        error
      } =
        await supabaseClient.auth.signUp({
          email: authEmail,
          password: authPassword,

          options: {
            emailRedirectTo: redirectUrl
          }
        });


      if (error) {

        showNotice(error.message);

      } else {

        showNotice(
          'Pendaftaran berhasil! Cek email untuk konfirmasi.'
        );

        setIsSignUp(false);

      }

      return;
    }


    /* ---------------- LOGIN ---------------- */

    const {
      error
    } =
      await supabaseClient.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });


    if (error) {

      showNotice(error.message);

    } else {

      showNotice(
        'Berhasil masuk akun!'
      );

      setShowAuthModal(false);

    }

  };


  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = async () => {

    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    setTemplates([
      {
        name: 'Arunika',
        list: ORIGINAL_PARTICIPANTS
      }
    ]);

    showNotice(
      'Berhasil keluar akun'
    );

  };


  /* =======================================================
     TAMBAH NAMA
     ======================================================= */

  const handleAddNames = () => {

    const text =
      inputBoxText.trim();

    if (!text) return;


    const lines =
      text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);


    const existing =
      new Set(
        participants.map(
          (person) =>
            person.toLowerCase()
        )
      );


    const added = [];


    lines.forEach((name) => {

      if (
        !existing.has(
          name.toLowerCase()
        )
      ) {

        added.push(name);

        existing.add(
          name.toLowerCase()
        );

      }

    });


    if (added.length === 0) {

      showNotice(
        'Nama tersebut sudah ada di daftar'
      );

    } else {

      setParticipants(
        (prev) => [
          ...prev,
          ...added
        ]
      );

      setInputBoxText('');

      setGroups([]);

      showNotice(
        `${added.length} nama berhasil ditambahkan`
      );

    }

  };


  /* =======================================================
     HAPUS PESERTA
     ======================================================= */

  const removeParticipant = (index) => {

    const person =
      participants[index];

    setParticipants(
      (current) =>
        current.filter(
          (_, personIndex) =>
            personIndex !== index
        )
    );

    setGroups([]);

    showNotice(
      `${person} dihapus`
    );

  };


  /* =======================================================
     HAPUS SEMUA
     ======================================================= */

  const clearAllParticipants = () => {

    if (
      window.confirm(
        'Hapus seluruh daftar peserta?'
      )
    ) {

      setParticipants([]);

      setGroups([]);

      setDuels([]);

      setQueueList([]);

      showNotice(
        'Semua nama dihapus'
      );

    }

  };


  /* =======================================================
     EDIT PESERTA
     ======================================================= */

  const saveEdit = (index) => {

    const cleanName =
      editingName.trim();

    if (!cleanName) return;


    const duplicate =
      participants.some(
        (person, personIndex) =>
          personIndex !== index &&
          person.toLowerCase() ===
            cleanName.toLowerCase()
      );


    if (duplicate) {

      showNotice(
        'Nama itu sudah ada di daftar'
      );

      return;

    }


    setParticipants(
      (current) =>
        current.map(
          (person, personIndex) =>
            personIndex === index
              ? cleanName
              : person
        )
    );


    setEditingIndex(null);

    setGroups([]);

    showNotice(
      'Nama diperbarui'
    );

  };


  /* =======================================================
     RESET
     ======================================================= */

  const resetList = () => {

    setParticipants(
      ORIGINAL_PARTICIPANTS
    );

    setGroups([]);

    setDuels([]);

    setQueueList([]);

    setGroupCountInput('4');

    setEditingIndex(null);

    showNotice(
      'Daftar awal dikembalikan'
    );

  };


  /* =======================================================
     JUMLAH KELOMPOK EFEKTIF
     ======================================================= */

  const effectiveGroupCount =
    useMemo(() => {

      const parsed =
        parseInt(
          groupCountInput,
          10
        );

      if (
        isNaN(parsed) ||
        parsed < 2
      ) {
        return 2;
      }

      return Math.min(
        parsed,
        Math.max(
          2,
          participants.length
        )
      );

    }, [
      groupCountInput,
      participants.length
    ]);


  /* =======================================================
     LABEL UKURAN KELOMPOK
     ======================================================= */

  const groupSizeLabel =
    useMemo(() => {

      if (!participants.length) {
        return 'Belum ada yang dibagi';
      }

      const smallest =
        Math.floor(
          participants.length /
            effectiveGroupCount
        );

      const largest =
        Math.ceil(
          participants.length /
            effectiveGroupCount
        );


      return smallest === largest
        ? `${smallest} per grup`
        : `${smallest}–${largest} per grup`;

    }, [
      effectiveGroupCount,
      participants.length
    ]);


  /* =======================================================
     ACAK KELOMPOK
     ======================================================= */

  const shuffleGroups = () => {

    if (
      !participants.length ||
      isShuffling
    ) {
      return;
    }


    setIsShuffling(true);

    setCopied(false);


    window.setTimeout(() => {

      const generated =
        createGroups(
          participants,
          effectiveGroupCount
        );


      setGroups(generated);

      setIsShuffling(false);

      showNotice(
        'Kelompok siap!'
      );


      const timeString =
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        );


      setHistory(
        (prev) => [
          {
            id: Date.now(),
            time: timeString,
            data: generated
          },
          ...prev
        ]
      );

    }, 420);

  };


  /* =======================================================
     DUEL
     ======================================================= */

  const makeDuels = () => {

    if (
      participants.length < 2
    ) {
      return;
    }


    const shuffled =
      [...participants].sort(
        () => Math.random() - 0.5
      );


    const pairs = [];


    for (
      let i = 0;
      i < shuffled.length;
      i += 2
    ) {

      if (
        i + 1 < shuffled.length
      ) {

        pairs.push([
          shuffled[i],
          shuffled[i + 1]
        ]);

      } else if (pairs.length) {

        pairs[
          pairs.length - 1
        ].push(
          shuffled[i]
        );

      }

    }


    setDuels(pairs);

    showNotice(
      'Pasangan duel dibentuk!'
    );

  };


  /* =======================================================
     QUEUE
     ======================================================= */

  const makeQueue = () => {

    if (!participants.length) {
      return;
    }


    const shuffled =
      [...participants].sort(
        () => Math.random() - 0.5
      );


    setQueueList(shuffled);

    showNotice(
      'Urutan giliran diacak!'
    );

  };


  /* =======================================================
     SIMPAN TEMPLATE
     ======================================================= */

  const saveAsTemplate = async () => {

    if (!user) {

      showNotice(
        'Silakan login akun terlebih dahulu'
      );

      setShowAuthModal(true);

      return;
    }


    const name =
      templateNameInput.trim();


    if (!name) {

      showNotice(
        'Ketik nama template terlebih dahulu'
      );

      return;
    }


    if (!participants.length) {

      showNotice(
        'Daftar nama masih kosong'
      );

      return;
    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from('templates')
        .insert([
          {
            user_id: user.id,
            name,
            list: participants
          }
        ])
        .select();


    if (error) {

      showNotice(
        'Gagal menyimpan: ' +
        error.message
      );

    } else if (data) {

      setTemplates(
        (prev) => [
          ...prev,
          {
            id: data[0].id,
            name,
            list: participants
          }
        ]
      );


      setTemplateNameInput('');

      showNotice(
        `Template "${name}" tersimpan di Cloud!`
      );

    }

  };


  /* =======================================================
     LOAD TEMPLATE
     ======================================================= */

  const loadTemplate = (list) => {

    setParticipants([
      ...list
    ]);

    setGroups([]);

    showNotice(
      'Template dimuat ke daftar'
    );

  };


  /* =======================================================
     DELETE TEMPLATE
     ======================================================= */

  const deleteTemplate = async (
    e,
    id,
    index
  ) => {

    e.stopPropagation();

    if (!user) return;


    if (
      window.confirm(
        'Hapus template ini dari Cloud?'
      )
    ) {

      if (id) {

        await supabaseClient
          .from('templates')
          .delete()
          .eq('id', id);

      }


      setTemplates(
        (prev) =>
          prev.filter(
            (_, i) =>
              i !== index
          )
      );


      showNotice(
        'Template dihapus'
      );

    }

  };


  /* =======================================================
     SPIN WHEEL
     ======================================================= */

  const startSpin = () => {

    if (
      spinning ||
      participants.length < 2
    ) {
      return;
    }


    setSpinning(true);

    setSelectedWinner(null);


    const randomIndex =
      Math.floor(
        Math.random() *
          participants.length
      );


    const sliceAngle =
      360 / participants.length;


    const extraTurns =
      6 * 360;


    const targetDegree =
      wheelRotation +
      extraTurns +
      (
        360 -
        (
          randomIndex *
          sliceAngle
        ) -
        sliceAngle / 2
      );


    setWheelRotation(
      targetDegree
    );


    setTimeout(() => {

      setSpinning(false);


      const winner =
        participants[randomIndex];


      setSelectedWinner(
        winner
      );


      if (
        removeWinnerOnSelect
      ) {

        setParticipants(
          (current) =>
            current.filter(
              (_, i) =>
                i !== randomIndex
            )
        );


        showNotice(
          `Pemenang ${winner} terpilih dan dihapus!`
        );

      } else {

        showNotice(
          `Terpilih: ${winner}!`
        );

      }

    }, 3800);

  };


  /* =======================================================
     COPY HASIL KELOMPOK
     ======================================================= */

  const copyGroups = async () => {

    if (!groups.length) {
      return;
    }


    const text =
      groups
        .map(
          (group) =>
            `KELOMPOK ${group.id + 1}\n` +
            group.names
              .map(
                (name) =>
                  `• ${name}`
              )
              .join('\n')
        )
        .join('\n\n');


    try {

      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      showNotice(
        'Kelompok disalin ke clipboard'
      );


      window.setTimeout(
        () => setCopied(false),
        2400
      );

    } catch {

      showNotice(
        'Clipboard tidak dapat diakses'
      );

    }

  };


  /* =======================================================
     RENDER
     ======================================================= */

  return React.createElement(
    'main',
    {
      className: 'app-shell'
    },

    /* -----------------------------------------------------
       ORB BACKGROUND
       ----------------------------------------------------- */

    React.createElement(
      'div',
      {
        className:
          'ambient-orb ambient-orb-one'
      }
    ),

    React.createElement(
      'div',
      {
        className:
          'ambient-orb ambient-orb-two'
      }
    ),


    /* =====================================================
       HEADER
       ===================================================== */

    React.createElement(
      'header',
      {
        className: 'site-header'
      },

      React.createElement(
        'div',
        {
          className: 'brand-lockup'
        },

        React.createElement(
          'div',
          {
            className: 'brand-mark'
          },

          React.createElement(
            'span'
          ),

          React.createElement(
            'span'
          ),

          React.createElement(
            'span'
          )
        ),

        React.createElement(
          'span',
          null,
          'Arunika',

          React.createElement(
            'span',
            {
              className: 'brand-light'
            },
            'Mix'
          )
        )
      ),


      React.createElement(
        'div',
        {
          className: 'header-note',
          style: {
            gap: '10px'
          }
        },

        user

          ? React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }
              },

              React.createElement(
                'span',
                {
                  style: {
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }
                },
                user.email.split('@')[0]
              ),

              React.createElement(
                'button',
                {
                  type: 'button',
                  className:
                    'copy-button',
                  onClick:
                    handleLogout,
                  style: {
                    padding:
                      '4px 8px',
                    fontSize:
                      '11px'
                  }
                },
                'Keluar'
              )
            )

          : React.createElement(
              'button',
              {
                type: 'button',
                className:
                  'copy-button',
                onClick: () =>
                  setShowAuthModal(
                    true
                  ),
                style: {
                  padding:
                    '4px 10px',
                  fontSize:
                    '12px'
                }
              },
              'Masuk / Daftar Akun'
            )
      )
    ),


    /* =====================================================
       HERO
       ===================================================== */

    React.createElement(
      'section',
      {
        className: 'hero-wrap'
      },

      React.createElement(
        'div',
        {
          className: 'hero-copy'
        },

        React.createElement(
          'div',
          {
            className: 'eyebrow'
          },

          React.createElement(
            Icon,
            {
              name: 'sparkles',
              size: 14
            }
          ),

          'PEMBAGI KELOMPOK ACAK & MINI GAMES'
        ),


        React.createElement(
          'h1',
          null,
          'Beri ruang',

          React.createElement(
            'br'
          ),

          React.createElement(
            'em',
            null,
            'untuk kejutan.'
          )
        ),


        React.createElement(
          'p',
          null,
          'Ubah kerumunan menjadi tim-tim kecil atau undian seru secara adil tanpa repot.'
        )
      ),


      React.createElement(
        'div',
        {
          className: 'hero-stamp'
        },

        React.createElement(
          'span',
          {
            className:
              'stamp-number'
          },
          participants.length
        ),

        React.createElement(
          'span',
          {
            className:
              'stamp-caption'
          },
          'orang',

          React.createElement(
            'br'
          ),

          'di dalamnya'
        ),

        React.createElement(
          'div',
          {
            className:
              'stamp-line'
          }
        ),

        React.createElement(
          'span',
          {
            className:
              'stamp-caption'
          },
          'satu titik awal',

          React.createElement(
            'br'
          ),

          'yang adil'
        )
      )
    ),


    /* =====================================================
       AUTH MODAL
       ===================================================== */

    showAuthModal &&
      React.createElement(
        'div',
        {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: 'grid',
            placeItems: 'center',
            padding: '15px'
          }
        },

        React.createElement(
          'div',
          {
            className: 'panel',
            style: {
              width: '100%',
              maxWidth: '380px',
              background:
                'var(--paper-light)'
            }
          },

          React.createElement(
            'h3',
            null,
            isSignUp
              ? 'Daftar Akun Baru'
              : 'Masuk ke ArunikaMix'
          ),

          React.createElement(
            'p',
            {
              className:
                'panel-intro'
            },
            'Simpan template nama milikmu di Cloud agar tidak hilang.'
          ),

          React.createElement(
            'form',
            {
              onSubmit:
                handleAuth
            },

            React.createElement(
              'input',
              {
                type: 'email',
                required: true,
                placeholder:
                  'Email kamu...',
                value: authEmail,
                onChange: (e) =>
                  setAuthEmail(
                    e.target.value
                  ),
                style: {
                  width: '100%',
                  padding: '10px',
                  borderRadius:
                    '8px',
                  border:
                    '1px solid var(--line)',
                  marginBottom:
                    '8px'
                }
              }
            ),

            React.createElement(
              'input',
              {
                type: 'password',
                required: true,
                placeholder:
                  'Kata sandi...',
                value: authPassword,
                onChange: (e) =>
                  setAuthPassword(
                    e.target.value
                  ),
                style: {
                  width: '100%',
                  padding: '10px',
                  borderRadius:
                    '8px',
                  border:
                    '1px solid var(--line)',
                  marginBottom:
                    '12px'
                }
              }
            ),

            React.createElement(
              'button',
              {
                type: 'submit',
                className:
                  'shuffle-button',
                style: {
                  width: '100%',
                  padding: '10px'
                }
              },
              isSignUp
                ? 'Daftar Sekarang'
                : 'Masuk Akun'
            )
          ),

          React.createElement(
            'div',
            {
              style: {
                marginTop: '12px',
                fontSize: '12px',
                textAlign:
                  'center',
                cursor: 'pointer',
                color:
                  'var(--coral-deep)'
              },

              onClick: () =>
                setIsSignUp(
                  !isSignUp
                )
            },

            isSignUp
              ? 'Sudah punya akun? Masuk'
              : 'Belum punya akun? Daftar'
          ),

          React.createElement(
            'button',
            {
              type: 'button',
              className:
                'copy-button',
              onClick: () =>
                setShowAuthModal(
                  false
                ),
              style: {
                width: '100%',
                marginTop: '10px'
              }
            },
            'Batal'
          )
        )
      ),


    /* =====================================================
       TAB NAVIGATION
       ===================================================== */

    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          gap: '8px',
          marginBottom: '22px',
          flexWrap: 'wrap'
        }
      },

      React.createElement(
        'button',
        {
          type: 'button',
          className:
            'copy-button',
          onClick: () =>
            setActiveTab(
              'groups'
            ),
          style: {
            background:
              activeTab === 'groups'
                ? 'var(--plum)'
                : 'var(--paper-light)',
            color:
              activeTab === 'groups'
                ? '#fff'
                : 'var(--ink)'
          }
        },

        React.createElement(
          Icon,
          {
            name: 'users',
            size: 16
          }
        ),

        ' Pembagi Kelompok'
      ),


      React.createElement(
        'button',
        {
          type: 'button',
          className:
            'copy-button',
          onClick: () =>
            setActiveTab(
              'wheel'
            ),
          style: {
            background:
              activeTab === 'wheel'
                ? 'var(--plum)'
                : 'var(--paper-light)',
            color:
              activeTab === 'wheel'
                ? '#fff'
                : 'var(--ink)'
          }
        },

        React.createElement(
          Icon,
          {
            name: 'disc',
            size: 16
          }
        ),

        ' Roda Putar (Spin Wheel)'
      ),


      React.createElement(
        'button',
        {
          type: 'button',
          className:
            'copy-button',
          onClick: () =>
            setActiveTab(
              'duel'
            ),
          style: {
            background:
              activeTab === 'duel'
                ? 'var(--plum)'
                : 'var(--paper-light)',
            color:
              activeTab === 'duel'
                ? '#fff'
                : 'var(--ink)'
          }
        },

        React.createElement(
          Icon,
          {
            name:
              'git-pull-request',
            size: 16
          }
        ),

        ' Undian Berpasangan (Duel)'
      ),


      React.createElement(
        'button',
        {
          type: 'button',
          className:
            'copy-button',
          onClick: () =>
            setActiveTab(
              'queue'
            ),
          style: {
            background:
              activeTab === 'queue'
                ? 'var(--plum)'
                : 'var(--paper-light)',
            color:
              activeTab === 'queue'
                ? '#fff'
                : 'var(--ink)'
          }
        },

        React.createElement(
          Icon,
          {
            name:
              'list-ordered',
            size: 16
          }
        ),

        ' Urutan Antrean / Giliran'
      )
    ),


    /* =====================================================
       WORKSPACE
       ===================================================== */

    React.createElement(
      'div',
      {
        className: 'workspace'
      },


      /* ===================================================
         PARTICIPANT PANEL
         =================================================== */

      React.createElement(
        'div',
        {
          className: 'panel'
        },

        React.createElement(
          'div',
          {
            className:
              'panel-heading'
          },

          React.createElement(
            'div',
            null,

            React.createElement(
              'div',
              {
                className:
                  'section-kicker'
              },

              React.createElement(
                Icon,
                {
                  name: 'users',
                  size: 15
                }
              ),

              ' PESERTA'
            ),

            React.createElement(
              'h2',
              null,
              'Daftar peserta ',

              React.createElement(
                'span',
                null,
                `(${participants.length})`
              )
            )
          ),


          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '4px'
              }
            },

            React.createElement(
              'button',
              {
                type: 'button',
                className:
                  'icon-button delete-action',
                onClick:
                  clearAllParticipants,
                title:
                  'Hapus Semua Nama'
              },

              React.createElement(
                Icon,
                {
                  name: 'trash-2',
                  size: 16
                }
              )
            ),

            React.createElement(
              'button',
              {
                type: 'button',
                className:
                  'icon-button',
                onClick:
                  reset
