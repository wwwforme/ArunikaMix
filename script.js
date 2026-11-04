const { useState, useEffect, useMemo } = React;

/* =========================================================
   SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = 'https://hldsxluraxvsxscjfbqf.supabase.co';

const SUPABASE_ANON_KEY = 
  'sb_publishable_UHd_c11RvO2W814V17CbrA_v3WmdRF0';
let supabaseClient = null;

try {
  if (
    window.supabase &&
    typeof window.supabase.createClient === 'function'
  ) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.error('Supabase gagal diinisialisasi:', error);
}


/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_PEOPLE = [
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

const TABS = [
  {
    id: 'groups',
    label: 'Pembagi Kelompok',
    icon: 'users'
  },
  {
    id: 'wheel',
    label: 'Roda Putar',
    icon: 'refresh-cw'
  },
  {
    id: 'duel',
    label: 'Undian Berpasangan',
    icon: 'swords'
  },
  {
    id: 'queue',
    label: 'Urutan Antrean',
    icon: 'list-ordered'
  }
];


/* =========================================================
   HELPERS
========================================================= */

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


function makeGroups(people, count) {
  if (!people.length) return [];

  const safeCount = Math.max(
    1,
    Math.min(Number(count) || 1, people.length)
  );

  const shuffled = shuffleArray(people);

  const groups = Array.from(
    { length: safeCount },
    (_, index) => ({
      id: index,
      people: []
    })
  );

  shuffled.forEach((person, index) => {
    groups[index % safeCount].people.push(person);
  });

  return groups;
}


function getGroupSizeText(total, count) {
  if (!total || !count) return '—';

  const smallest = Math.floor(total / count);
  const largest = Math.ceil(total / count);

  return smallest === largest
    ? `${smallest} per grup`
    : `${smallest}–${largest} per grup`;
}


function copyText(text) {
  if (!navigator.clipboard) {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error(error);
    }

    document.body.removeChild(textarea);

    return Promise.resolve();
  }

  return navigator.clipboard.writeText(text);
}


function createGroupText(groups) {
  return groups
    .map((group) => {
      return `KELOMPOK ${group.id + 1}\n${group.people
        .map((name) => `• ${name}`)
        .join('\n')}`;
    })
    .join('\n\n');
}


/* =========================================================
   ICON HELPER
========================================================= */

function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  className = ''
}) {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  return React.createElement('i', {
    'data-lucide': name,
    width: size,
    height: size,
    'stroke-width': strokeWidth,
    className
  });
}


/* =========================================================
   APP
========================================================= */

function App() {
  const [people, setPeople] = useState(DEFAULT_PEOPLE);

  const [activeTab, setActiveTab] = useState('groups');

  const [groupCount, setGroupCount] = useState(4);

  const [groups, setGroups] = useState([]);

  const [history, setHistory] = useState([]);

  const [newPeople, setNewPeople] = useState('');

  const [editingIndex, setEditingIndex] = useState(null);

  const [editingName, setEditingName] = useState('');

  const [toast, setToast] = useState('');

  const [wheelPeople, setWheelPeople] = useState(DEFAULT_PEOPLE);

  const [wheelWinner, setWheelWinner] = useState(null);

  const [removeWheelWinner, setRemoveWheelWinner] = useState(false);

  const [duels, setDuels] = useState([]);

  const [queue, setQueue] = useState([]);

  const [showAuthModal, setShowAuthModal] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);

  const [authEmail, setAuthEmail] = useState('');

  const [authPassword, setAuthPassword] = useState('');

  const [user, setUser] = useState(null);

  const [cloudTemplates, setCloudTemplates] = useState([]);

  const [templateName, setTemplateName] = useState('');

  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const [loadingCloud, setLoadingCloud] = useState(false);


  /* =======================================================
     TOAST
  ======================================================= */

  const showNotice = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast('');
    }, 2500);
  };


  /* =======================================================
     SUPABASE AUTH
  ======================================================= */

  useEffect(() => {
    if (!supabaseClient) return;

    let mounted = true;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data?.session?.user || null);
      }
    });

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);


  /* =======================================================
     LUCIDE REFRESH
  ======================================================= */

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });


  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const savedPeople = localStorage.getItem(
        'arunikamix_people'
      );

      const savedGroups = localStorage.getItem(
        'arunikamix_groups'
      );

      const savedHistory = localStorage.getItem(
        'arunikamix_history'
      );

      if (savedPeople) {
        const parsed = JSON.parse(savedPeople);

        if (Array.isArray(parsed)) {
          setPeople(parsed);
          setWheelPeople(parsed);
        }
      }

      if (savedGroups) {
        const parsed = JSON.parse(savedGroups);

        if (Array.isArray(parsed)) {
          setGroups(parsed);
        }
      }

      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);

        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Gagal membaca localStorage:',
        error
      );
    }
  }, []);


  useEffect(() => {
    localStorage.setItem(
      'arunikamix_people',
      JSON.stringify(people)
    );

    setWheelPeople((current) => {
      if (
        current.length === 0 ||
        current.every((person) => people.includes(person))
      ) {
        return people;
      }

      return current.filter((person) =>
        people.includes(person)
      );
    });
  }, [people]);


  useEffect(() => {
    localStorage.setItem(
      'arunikamix_groups',
      JSON.stringify(groups)
    );
  }, [groups]);


  useEffect(() => {
    localStorage.setItem(
      'arunikamix_history',
      JSON.stringify(history)
    );
  }, [history]);


  /* =======================================================
     ADD PEOPLE
  ======================================================= */

  const addPeople = () => {
    const names = newPeople
      .split(/\n|,/)
      .map((name) => name.trim())
      .filter(Boolean);

    if (!names.length) {
      showNotice('Masukkan nama terlebih dahulu.');
      return;
    }

    const existing = new Set(
      people.map((person) => person.toLowerCase())
    );

    const uniqueNames = names.filter(
      (name) => !existing.has(name.toLowerCase())
    );

    if (!uniqueNames.length) {
      showNotice('Nama tersebut sudah ada.');
      return;
    }

    setPeople((current) => [
      ...current,
      ...uniqueNames
    ]);

    setNewPeople('');

    showNotice(
      `${uniqueNames.length} orang ditambahkan`
    );
  };


  /* =======================================================
     DELETE PERSON
  ======================================================= */

  const deletePerson = (index) => {
    const person = people[index];

    if (!person) return;

    setPeople((current) =>
      current.filter((_, personIndex) =>
        personIndex !== index
      )
    );

    setGroups((current) =>
      current.map((group) => ({
        ...group,
        people: group.people.filter(
          (name) => name !== person
        )
      }))
    );

    setWheelPeople((current) =>
      current.filter((name) => name !== person)
    );

    showNotice(`${person} dihapus`);
  };


  /* =======================================================
     EDIT PERSON
  ======================================================= */

  const startEditing = (index) => {
    setEditingIndex(index);
    setEditingName(people[index]);
  };


  const saveEditing = () => {
    if (editingIndex === null) return;

    const cleanName = editingName.trim();

    if (!cleanName) {
      showNotice('Nama tidak boleh kosong.');
      return;
    }

    const duplicate = people.some(
      (person, index) =>
        index !== editingIndex &&
        person.toLowerCase() ===
          cleanName.toLowerCase()
    );

    if (duplicate) {
      showNotice('Nama tersebut sudah ada.');
      return;
    }

    const oldName = people[editingIndex];

    setPeople((current) =>
      current.map((person, index) =>
        index === editingIndex
          ? cleanName
          : person
      )
    );

    setGroups((current) =>
      current.map((group) => ({
        ...group,
        people: group.people.map((name) =>
          name === oldName ? cleanName : name
        )
      }))
    );

    setWheelPeople((current) =>
      current.map((name) =>
        name === oldName ? cleanName : name
      )
    );

    setEditingIndex(null);
    setEditingName('');

    showNotice('Nama berhasil diperbarui');
  };


  /* =======================================================
     CLEAR PEOPLE
  ======================================================= */

  const clearPeople = () => {
    if (!people.length) {
      showNotice('Daftar sudah kosong.');
      return;
    }

    setPeople([]);
    setGroups([]);
    setWheelPeople([]);
    setDuels([]);
    setQueue([]);

    showNotice('Semua nama dihapus');
  };


  /* =======================================================
     RESET ORIGINAL
  ======================================================= */

  const resetPeople = () => {
    setPeople(DEFAULT_PEOPLE);
    setGroups([]);
    setWheelPeople(DEFAULT_PEOPLE);
    setDuels([]);
    setQueue([]);
    setHistory([]);

    showNotice('Daftar dikembalikan ke awal');
  };


  /* =======================================================
     MAKE GROUPS
  ======================================================= */

  const shuffleGroups = () => {
    if (!people.length) {
      showNotice('Tambahkan nama terlebih dahulu.');
      return;
    }

    const count = Math.max(
      1,
      Math.min(groupCount, people.length)
    );

    const result = makeGroups(
      people,
      count
    );

    setGroups(result);

    setHistory((current) => [
      {
        id: Date.now(),
        groups: result,
        createdAt: new Date().toISOString()
      },
      ...current
    ].slice(0, 10));

    showNotice(
      `Berhasil membagi ${people.length} orang`
    );
  };


  /* =======================================================
     COPY GROUPS
  ======================================================= */

  const copyGroups = () => {
    if (!groups.length) {
      showNotice('Belum ada pembagian kelompok.');
      return;
    }

    const text = createGroupText(groups);

    copyText(text)
      .then(() => {
        showNotice('Pembagian disalin');
      })
      .catch(() => {
        showNotice('Gagal menyalin');
      });
  };


  /* =======================================================
     WHEEL
  ======================================================= */

  const spinWheel = () => {
    if (!wheelPeople.length) {
      showNotice('Tidak ada nama di roda putar.');
      return;
    }

    const winner =
      wheelPeople[
        Math.floor(
          Math.random() * wheelPeople.length
        )
      ];

    setWheelWinner(winner);

    if (removeWheelWinner) {
      setWheelPeople((current) =>
        current.filter(
          (person) => person !== winner
        )
      );
    }

    showNotice(`${winner} terpilih!`);
  };


  const resetWheel = () => {
    setWheelPeople(people);
    setWheelWinner(null);

    showNotice('Roda dikembalikan');
  };


  /* =======================================================
     DUELS
  ======================================================= */

  const createDuels = () => {
    if (!people.length) {
      showNotice('Tambahkan nama terlebih dahulu.');
      return;
    }

    const shuffled = shuffleArray(people);

    const result = [];

    for (
      let index = 0;
      index < shuffled.length;
      index += 2
    ) {
      result.push({
        id: result.length,
        first: shuffled[index],
        second:
          shuffled[index + 1] || null
      });
    }

    setDuels(result);

    showNotice(
      `${result.length} pasangan dibuat`
    );
  };


  /* =======================================================
     QUEUE
  ======================================================= */

  const createQueue = () => {
    if (!people.length) {
      showNotice('Tambahkan nama terlebih dahulu.');
      return;
    }

    setQueue(shuffleArray(people));

    showNotice('Urutan baru dibuat');
  };


  /* =======================================================
     AUTH
  ======================================================= */

  const handleAuth = async (event) => {
    event.preventDefault();

    if (!supabaseClient) {
      showNotice('Supabase belum tersedia.');
      return;
    }

    if (!authEmail || !authPassword) {
      showNotice('Email dan password wajib diisi.');
      return;
    }

    setLoadingCloud(true);

    try {
      if (isSignUp) {
        const redirectUrl =
          window.location.origin +
          window.location.pathname;

        const { error } =
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
      } else {
        const { error } =
          await supabaseClient.auth.signInWithPassword({
            email: authEmail,
            password: authPassword
          });

        if (error) {
          showNotice(error.message);
        } else {
          showNotice('Berhasil masuk akun!');

          setShowAuthModal(false);
        }
      }
    } catch (error) {
      console.error(error);

      showNotice(
        'Terjadi kesalahan saat menghubungi server.'
      );
    } finally {
      setLoadingCloud(false);
    }
  };


  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = async () => {
    if (!supabaseClient) return;

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      showNotice(error.message);
      return;
    }

    setUser(null);
    setCloudTemplates([]);

    showNotice('Berhasil keluar');
  };


  /* =======================================================
     LOAD CLOUD TEMPLATES
  ======================================================= */

  const loadCloudTemplates = async () => {
    if (!supabaseClient || !user) {
      return;
    }

    setLoadingCloud(true);

    try {
      const { data, error } =
        await supabaseClient
          .from('templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {
            ascending: false
          });

      if (error) {
        console.error(error);

        showNotice(
          'Gagal memuat template cloud.'
        );

        return;
      }

      setCloudTemplates(data || []);
    } catch (error) {
      console.error(error);

      showNotice(
        'Gagal memuat template cloud.'
      );
    } finally {
      setLoadingCloud(false);
    }
  };


  useEffect(() => {
    if (user) {
      loadCloudTemplates();
    } else {
      setCloudTemplates([]);
    }
  }, [user]);


  /* =======================================================
     SAVE CLOUD TEMPLATE
  ======================================================= */

  const saveCloudTemplate = async () => {
    if (!supabaseClient || !user) {
      setShowAuthModal(true);
      return;
    }

    const cleanName = templateName.trim();

    if (!cleanName) {
      showNotice('Masukkan nama template.');
      return;
    }

    if (!people.length) {
      showNotice('Daftar nama masih kosong.');
      return;
    }

    setLoadingCloud(true);

    try {
      const { error } =
        await supabaseClient
          .from('templates')
          .insert({
            user_id: user.id,
            name: cleanName,
            people: people
          });

      if (error) {
        console.error(error);

        showNotice(
          error.message ||
            'Gagal menyimpan template.'
        );

        return;
      }

      setTemplateName('');
      setShowTemplateModal(false);

      await loadCloudTemplates();

      showNotice('Template tersimpan');
    } catch (error) {
      console.error(error);

      showNotice(
        'Gagal menyimpan template.'
      );
    } finally {
      setLoadingCloud(false);
    }
  };


  /* =======================================================
     LOAD TEMPLATE
  ======================================================= */

  const loadTemplate = (template) => {
    if (!template) return;

    const templatePeople =
      Array.isArray(template.people)
        ? template.people
        : [];

    setPeople(templatePeople);
    setWheelPeople(templatePeople);
    setGroups([]);
    setDuels([]);
    setQueue([]);

    showNotice(
      `Template "${template.name}" dimuat`
    );
  };


  /* =======================================================
     DELETE TEMPLATE
  ======================================================= */

  const deleteTemplate = async (template) => {
    if (!supabaseClient || !user) return;

    const { error } =
      await supabaseClient
        .from('templates')
        .delete()
        .eq('id', template.id)
        .eq('user_id', user.id);

    if (error) {
      showNotice(
        error.message ||
          'Gagal menghapus template.'
      );

      return;
    }

    setCloudTemplates((current) =>
      current.filter(
        (item) => item.id !== template.id
      )
    );

    showNotice('Template dihapus');
  };


  /* =======================================================
     COMPUTED
  ======================================================= */

  const groupSizeText = useMemo(
    () =>
      getGroupSizeText(
        people.length,
        groupCount
      ),
    [people.length, groupCount]
  );


  /* =======================================================
     RENDER
  ======================================================= */

  return React.createElement(
    React.Fragment,
    null,

    /* =====================================================
       HEADER
    ===================================================== */

    React.createElement(
      'header',
      { className: 'topbar' },

      React.createElement(
        'div',
        { className: 'brand-lockup' },

        React.createElement(
          'div',
          { className: 'brand-mark' },

          React.createElement('span', {
            key: 'one'
          }),

          React.createElement('span', {
            key: 'two'
          }),

          React.createElement('span', {
            key: 'three'
          })
        ),

        React.createElement(
          'span',
          null,
          'ArunikaMix'
        )
      ),

      React.createElement(
        'div',
        { className: 'topbar-actions' },

        user
          ? React.createElement(
              React.Fragment,
              null,

              React.createElement(
                'span',
                {
                  className: 'user-email'
                },
                user.email
              ),

              React.createElement(
                'button',
                {
                  className: 'btn btn-ghost',
                  onClick: logout
                },
                React.createElement(Icon, {
                  name: 'log-out',
                  size: 16
                }),
                'Keluar'
              )
            )
          : React.createElement(
              'button',
              {
                className: 'btn btn-ghost',
                onClick: () => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }
              },
              React.createElement(Icon, {
                name: 'cloud',
                size: 16
              }),
              'Cloud'
            )
      )
    ),


    /* =====================================================
       HERO
    ===================================================== */

    React.createElement(
      'section',
      { className: 'hero-wrap' },

      React.createElement(
        'div',
        { className: 'hero-copy' },

        React.createElement(
          'div',
          {
            className: 'eyebrow'
          },
          'PEMBAGI KELOMPOK ACAK & MINI GAMES'
        ),

        React.createElement(
          'h1',
          null,
          'Beri ruang untuk ',
          React.createElement(
            'em',
            null,
            'kejutan.'
          )
        ),

        React.createElement(
          'p',
          null,
          'Satu daftar nama, banyak kemungkinan. ',
          'Bagi kelompok, putar roda, adu pasangan, ',
          'atau tentukan urutan giliran secara acak.'
        )
      ),

      React.createElement(
        'div',
        { className: 'hero-stamp' },

        React.createElement(
          'div',
          { className: 'stamp-number' },
          people.length
        ),

        React.createElement(
          'div',
          { className: 'stamp-caption' },
          'orang di dalamnya'
        ),

        React.createElement(
          'div',
          { className: 'stamp-line' }
        ),

        React.createElement(
          'div',
          { className: 'stamp-caption' },
          'satu titik awal yang adil'
        )
      )
    ),


    /* =====================================================
       TABS
    ===================================================== */

    React.createElement(
      'nav',
      { className: 'tabs' },

      TABS.map((tab) =>
        React.createElement(
          'button',
          {
            key: tab.id,
            className:
              activeTab === tab.id
                ? 'tab active'
                : 'tab',
            onClick: () =>
              setActiveTab(tab.id)
          },

          React.createElement(Icon, {
            name: tab.icon,
            size: 17
          }),

          tab.label
        )
      )
    ),


    /* =====================================================
       MAIN
    ===================================================== */

    React.createElement(
      'main',
      { className: 'app-grid' },

      /* ===================================================
         SIDEBAR
      =================================================== */

      React.createElement(
        'aside',
        { className: 'sidebar' },

        React.createElement(
          'div',
          { className: 'panel-heading' },

          React.createElement(
            'div',
            null,

            React.createElement(
              'div',
              {
                className: 'section-kicker'
              },
              'DAFTAR PESERTA'
            ),

            React.createElement(
              'h2',
              null,
              `${people.length} orang`
            )
          )
        ),

        /* Add names */

        React.createElement(
          'div',
          {
            className:
              'add-people-box'
          },

          React.createElement(
            'textarea',
            {
              value: newPeople,
              onChange: (event) =>
                setNewPeople(
                  event.target.value
                ),
              placeholder:
                'Tambah nama...\nSatu nama per baris'
            }
          ),

          React.createElement(
            'button',
            {
              className:
                'btn btn-primary full',
              onClick: addPeople
            },

            React.createElement(Icon, {
              name: 'plus',
              size: 17
            }),

            'Tambah'
          )
        ),

        /* Person list */

        React.createElement(
          'div',
          {
            className:
              'people-list'
          },

          people.length
            ? people.map(
                (person, index) =>
                  React.createElement(
                    'div',
                    {
                      className:
                        'person-row',
                      key:
                        `${person}-${index}`
                    },

                    editingIndex === index
                      ? React.createElement(
                          React.Fragment,
                          null,

                          React.createElement(
                            'input',
                            {
                              className:
                                'person-edit-input',
                              value:
                                editingName,
                              onChange:
                                (event) =>
                                  setEditingName(
                                    event.target
                                      .value
                                  ),
                              autoFocus: true,
                              onKeyDown:
                                (event) => {
                                  if (
                                    event.key ===
                                    'Enter'
                                  ) {
                                    saveEditing();
                                  }

                                  if (
                                    event.key ===
                                    'Escape'
                                  ) {
                                    setEditingIndex(
                                      null
                                    );
                                    setEditingName(
                                      ''
                                    );
                                  }
                                }
                            }
                          ),

                          React.createElement(
                            'button',
                            {
                              className:
                                'icon-btn',
                              onClick:
                                saveEditing
                            },
                            React.createElement(
                              Icon,
                              {
                                name: 'check',
                                size: 15
                              }
                            )
                          )
                        )
                      : React.createElement(
                          React.Fragment,
                          null,

                          React.createElement(
                            'span',
                            {
                              className:
                                'person-index'
                            },
                            String(
                              index + 1
                            ).padStart(2, '0')
                          ),

                          React.createElement(
                            'span',
                            {
                              className:
                                'person-name'
                            },
                            person
                          ),

                          React.createElement(
                            'div',
                            {
                              className:
                                'person-actions'
                            },

                            React.createElement(
                              'button',
                              {
                                className:
                                  'icon-btn',
                                title:
                                  'Edit',
                                onClick: () =>
                                  startEditing(
                                    index
                                  )
                              },

                              React.createElement(
                                Icon,
                                {
                                  name: 'pencil',
                                  size: 14
                                }
                              )
                            ),

                            React.createElement(
                              'button',
                              {
                                className:
                                  'icon-btn danger',
                                title:
                                  'Hapus',
                                onClick: () =>
                                  deletePerson(
                                    index
                                  )
                              },

                              React.createElement(
                                Icon,
                                {
                                  name: 'x',
                                  size: 14
                                }
                              )
                            )
                          )
                        )
                  )
              )
            : React.createElement(
                'div',
                {
                  className:
                    'empty-state small'
                },
                'Belum ada peserta.'
              )
        ),

        /* Sidebar bottom actions */

        React.createElement(
          'div',
          {
            className:
              'sidebar-actions'
          },

          React.createElement(
            'button',
            {
              className:
                'btn btn-secondary',
              onClick: resetPeople
            },

            React.createElement(Icon, {
              name: 'rotate-ccw',
              size: 15
            }),

            'Reset'
          ),

          React.createElement(
            'button',
            {
              className:
                'btn btn-secondary danger-text',
              onClick: clearPeople
            },

            React.createElement(Icon, {
              name: 'trash-2',
              size: 15
            }),

            'Kosongkan'
          )
        )
      ),


      /* ===================================================
         CONTENT
      =================================================== */

      React.createElement(
        'section',
        {
          className:
            'content-panel'
        },

        /* =================================================
           GROUPS TAB
        ================================================= */

        activeTab === 'groups' &&
          React.createElement(
            React.Fragment,
            null,

            React.createElement(
              'div',
              {
                className:
                  'content-header'
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
                  'PEMBAGI KELOMPOK'
                ),

                React.createElement(
                  'h2',
                  null,
                  'Kelompok yang seimbang'
                ),

                React.createElement(
                  'p',
                  null,
                  'Tentukan jumlah kelompok, ',
                  'lalu biarkan ArunikaMix ',
                  'mengacak pembagiannya.'
                )
              ),

              React.createElement(
                'div',
                {
                  className:
                    'group-controls'
                },

                React.createElement(
                  'label',
                  null,
                  'Jumlah grup',

                  React.createElement(
                    'select',
                    {
                      value: groupCount,
                      onChange: (
                        event
                      ) =>
                        setGroupCount(
                          Number(
                            event.target
                              .value
                          )
                        )
                    },

                    Array.from(
                      {
                        length:
                          Math.max(
                            1,
                            people.length
                          )
                      },
                      (_, index) =>
                        React.createElement(
                          'option',
                          {
                            key:
                              index + 1,
                            value:
                              index + 1
                          },
                          index + 1
                        )
                    )
                  )
                ),

                React.createElement(
                  'div',
                  {
                    className:
                      'group-size-note'
                  },
                  groupSizeText
                ),

                React.createElement(
                  'button',
                  {
                    className:
                      'btn btn-primary',
                    onClick:
                      shuffleGroups
                  },

                  React.createElement(
                    Icon,
                    {
                      name: 'shuffle',
                      size: 17
                    }
                  ),

                  'Acak kelompok'
                )
              )
            ),

            groups.length
              ? React.createElement(
                  'div',
                  {
                    className:
                      'groups-grid'
                  },

                  groups.map(
                    (group) =>
                      React.createElement(
                        'article',
                        {
                          key:
                            group.id,
                          className:
                            `group-card group-${GROUP_COLORS[
                              group.id %
                                GROUP_COLORS.length
                            ]}`
                        },

                        React.createElement(
                          'div',
                          {
                            className:
                              'group-card-head'
                          },

                          React.createElement(
                            'div',
                            {
                              className:
                                'group-label'
                            },
                            `KELOMPOK ${group.id + 1}`
                          ),

                          React.createElement(
                            'span',
                            {
                              className:
                                'group-count'
                            },
                            group.people.length
                          )
                        ),

                        React.createElement(
                          'div',
                          {
                            className:
                              'group-members'
                          },

                          group.people.map(
                            (
                              name,
                              index
                            ) =>
                              React.createElement(
                                'div',
                                {
                                  className:
                                    'group-member',
                                  key:
                                    `${name}-${index}`
                                },

                                React.createElement(
                                  'span',
                                  {
                                    className:
                                      'member-number'
                                  },
                                  String(
                                    index +
                                      1
                                  ).padStart(
                                    2,
                                    '0'
                                  )
                                ),

                                React.createElement(
                                  'span',
                                  null,
                                  name
                                )
                              )
                          )
                        )
                      )
                  )
                )
              : React.createElement(
                  'div',
                  {
                    className:
                      'groups-empty'
                  },

                  React.createElement(
                    'div',
                    {
                      className:
                        'empty-graphic'
                    },

                    React.createElement(
                      Icon,
                      {
                        name: 'shuffle',
                        size: 30
                      }
                    )
                  ),

                  React.createElement(
                    'h3',
                    null,
                    'Belum ada kelompok'
                  ),

                  React.createElement(
                    'p',
                    null,
                    'Pilih jumlah grup dan ',
                    'tekan tombol acak untuk ',
                    'memulai.'
                  )
                ),

            groups.length &&
              React.createElement(
                'div',
                {
                  className:
                    'result-actions'
                },

                React.createElement(
                  'button',
                  {
                    className:
                      'btn btn-secondary',
                    onClick:
                      copyGroups
                  },

                  React.createElement(
                    Icon,
                    {
                      name: 'copy',
                      size: 15
                    }
                  ),

                  'Salin hasil'
                )
              )
          ),


        /* =================================================
           WHEEL TAB
        ================================================= */

        activeTab === 'wheel' &&
          React.createElement(
            React.Fragment,
            null,

            React.createElement(
              'div',
              {
                className:
                  'content-header'
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
                  'RODA PUTAR'
                ),

                React.createElement(
                  'h2',
                  null,
                  'Siapa yang terpilih?'
                ),

                React.createElement(
                  'p',
                  null,
                  'Biarkan keberuntungan ',
                  'menentukan satu nama.'
                )
              )
            ),

            React.createElement(
              'div',
              {
                className:
                  'wheel-layout'
              },

              React.createElement(
                'div',
                {
                  className:
                    'wheel-placeholder'
                },

                React.createElement(
                  'div',
                  {
                    className:
                      'wheel-circle'
                  },

                  React.createElement(
                    'div',
                    {
                      className:
                        'wheel-inner'
                    },

                    React.createElement(
                      Icon,
                      {
                        name: 'shuffle',
                        size: 34
                      }
                    ),

                    React.createElement(
                      'span',
                      null,
                      'ARUNIKA'
                    )
                  )
                ),

                React.createElement(
                  'div',
                  {
                    className:
                      'wheel-pointer'
                  }
                )
              ),

              React.createElement(
                'div',
                {
                  className:
                    'wheel-controls'
                },

                React.createElement(
                  'div',
                  {
                    className:
                      'wheel-count'
                  },

                  React.createElement(
                    'strong',
                    null,
                    wheelPeople.length
                  ),

                  React.createElement(
                    'span',
                    null,
                    'nama tersisa'
                  )
                ),

                wheelWinner &&
                  React.createElement(
                    'div',
                    {
                      className:
                        'winner-card'
                    },

                    React.createElement(
                      'div',
                      {
                        className:
                          'section-kicker'
                      },
                      'TERPILIH'
                    ),

                    React.createElement(
                      'h3',
                      null,
                      wheelWinner
                    )
                  ),

                React.createElement(
                  'label',
                  {
                    className:
                      'checkbox-row'
                  },

                  React.createElement(
                    'input',
                    {
                      type: 'checkbox',
                      checked:
                        removeWheelWinner,
                      onChange: (
                        event
                      ) =>
                        setRemoveWheelWinner(
                          event.target
                            .checked
                        )
                    }
                  ),

                  React.createElement(
                    'span',
                    null,
                    'Hapus nama setelah terpilih'
                  )
                ),

                React.createElement(
                  'div',
                  {
                    className:
                      'button-row'
                  },

                  React.createElement(
                    'button',
                    {
                      className:
                        'btn btn-primary large',
                      onClick:
                        spinWheel
                    },

                    React.createElement(
                      Icon,
                      {
                        name: 'refresh-cw',
                        size: 18
                      }
                    ),

                    'PUTAR'
                  ),

                  React.createElement(
                    'button',
                    {
                      className:
                        'btn btn-secondary',
                      onClick:
                        resetWheel
                    },

                    'Reset'
                  )
                )
              )
            )
          ),


        /* =================================================
           DUEL TAB
        ================================================= */

        activeTab === 'duel' &&
          React.createElement(
            React.Fragment,
            null,

            React.createElement(
              'div',
              {
                className:
                  'content-header'
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
                  'UNDian BERPASANGAN'
                ),

                React.createElement(
                  'h2',
                  null,
                  'Duel acak'
                ),

                React.createElement(
                  'p',
                  null,
                  'Pasangkan peserta secara ',
                  'acak untuk menentukan lawan.'
                )
              ),

              React.createElement(
                'button',
                {
                  className:
                    'btn btn-primary',
                  onClick:
                    createDuels
                },

                React.createElement(
                  Icon,
                  {
                    name: 'shuffle',
                    size: 17
                  }
                ),

                'Buat pasangan'
              )
            ),

            duels.length
              ? React.createElement(
                  'div',
                  {
                    className:
                      'duels-grid'
                  },

                  duels.map(
                    (duel) =>
                      React.createElement(
                        'article',
                        {
                          className:
                            'duel-card',
                          key:
                            duel.id
                        },

                        React.createElement(
                          'div',
                          {
                            className:
                              'duel-number'
                          },
                          `DUEL ${String(
                            duel.id + 1
                          ).padStart(2, '0')}`
                        ),

                        React.createElement(
                          'div',
                          {
                            className:
                              'duel-names'
                          },

                          React.createElement(
                            'div',
                            {
                              className:
                                'duel-person'
                            },
                            duel.first
                          ),

                          React.createElement(
                            'div',
                            {
                              className:
                                'duel-vs'
                            },
                            'VS'
                          ),

                          React.createElement(
                            'div',
                            {
                              className:
                                'duel-person'
                            },
                            duel.second ||
                              'BYE'
                          )
                        )
                      )
                  )
                )
              : React.createElement(
                  'div',
                  {
                    className:
                      'groups-empty'
                  },

                  React.createElement(
                    'div',
                    {
                      className:
                        'empty-graphic'
                    },

                    React.createElement(
                      Icon,
                      {
                        name: 'swords',
                        size: 30
                      }
                    )
                  ),

                  React.createElement(
                    'h3',
                    null,
                    'Belum ada pasangan'
                  ),

                  React.createElement(
                    'p',
                    null,
                    'Tekan tombol untuk ',
                    'mengacak pasangan.'
                  )
                )
          ),


        /* =================================================
           QUEUE TAB
        ================================================= */

        activeTab === 'queue' &&
          React.createElement(
            React.Fragment,
            null,

            React.createElement(
              'div',
              {
                className:
                  'content-header'
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
                  'URUTAN ANTREAN'
                ),

                React.createElement(
                  'h2',
                  null,
                  'Siapa duluan?'
                ),

                React.createElement(
                  'p',
                  null,
                  'Acak urutan giliran secara ',
                  'cepat dan adil.'
                )
              ),

              React.createElement(
                'button',
                {
                  className:
                    'btn btn-primary',
                  onClick:
                    createQueue
                },

                React.createElement(
                  Icon,
                  {
                    name: 'shuffle',
                    size: 17
                  }
                ),

                'Acak urutan'
              )
            ),

            queue.length
              ? React.createElement(
                  'div',
                  {
                    className:
                      'queue-list'
                  },

                  queue.map(
                    (person, index) =>
                      React.createElement(
                        'div',
                        {
                          className:
                            'queue-item',
                          key:
                            `${person}-${index}`
                        },

                        React.createElement(
                          'div',
                          {
                            className:
                              'queue-number'
                          },
                          String(
                            index + 1
                          ).padStart(2, '0')
                        ),

                        React.createElement(
                          'div',
                          {
                            className:
                              'queue-name'
                          },
                          person
                        )
                      )
                  )
                )
              : React.createElement(
                  'div',
                  {
                    className:
                      'groups-empty'
                  },

                  React.createElement(
                    'div',
                    {
                      className:
                        'empty-graphic'
                    },

                    React.createElement(
                      Icon,
                      {
                        name: 'list-ordered',
                        size: 30
                      }
                    )
                  ),

                  React.createElement(
                    'h3',
                    null,
                    'Belum ada urutan'
                  ),

                  React.createElement(
                    'p',
                    null,
                    'Tekan tombol untuk ',
                    'membuat antrean acak.'
                  )
                )
          )
      )
    ),


    /* =====================================================
       CLOUD SECTION
    ===================================================== */

    React.createElement(
      'section',
      {
        className:
          'cloud-section'
      },

      React.createElement(
        'div',
        {
          className:
            'cloud-section-header'
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
            'SUPABASE CLOUD'
          ),

          React.createElement(
            'h2',
            null,
            'Simpan daftar kamu'
          ),

          React.createElement(
            'p',
            null,
            user
              ? 'Template tersimpan di akunmu.'
              : 'Masuk untuk menyimpan template dan membukanya kembali.'
          )
        ),

        user
          ? React.createElement(
              'button',
              {
                className:
                  'btn btn-primary',
                onClick: () =>
                  setShowTemplateModal(
                    true
                  )
              },

              React.createElement(
                Icon,
                {
                  name: 'plus',
                  size: 16
                }
              ),

              'Simpan template'
            )
          : React.createElement(
              'button',
              {
                className:
                  'btn btn-primary',
                onClick: () => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }
              },

              React.createElement(
                Icon,
                {
                  name: 'log-in',
                  size: 16
                }
              ),

              'Masuk'
            )
      ),

      user &&
        React.createElement(
          'div',
          {
            className:
              'template-list'
          },

          loadingCloud
            ? React.createElement(
                'div',
                {
                  className:
                    'empty-state small'
                },
                'Memuat template...'
              )
            : cloudTemplates.length
              ? cloudTemplates.map(
                  (template) =>
                    React.createElement(
                      'div',
                      {
                        className:
                          'template-card',
                        key:
                          template.id
                      },

                      React.createElement(
                        'div',
                        null,

                        React.createElement(
                          'strong',
                          null,
                          template.name
                        ),

                        React.createElement(
                          'span',
                          null,
                          Array.isArray(
                            template.people
                          )
                            ? `${template.people.length} orang`
                            : 'Template'
                        )
                      ),

                      React.createElement(
                        'div',
                        {
                          className:
                            'template-actions'
                        },

                        React.createElement(
                          'button',
                          {
                            className:
                              'icon-btn',
                            onClick: () =>
                              loadTemplate(
                                template
                              ),
                            title:
                              'Muat template'
                          },

                          React.createElement(
                            Icon,
                            {
                              name: 'download',
                              size: 15
                            }
                          )
                        ),

                        React.createElement(
                          'button',
                          {
                            className:
                              'icon-btn danger',
                            onClick: () =>
                              deleteTemplate(
                                template
                              ),
                            title:
                              'Hapus template'
                          },

                          React.createElement(
                            Icon,
                            {
                              name: 'trash-2',
                              size: 15
                            }
                          )
                        )
                      )
                    )
                )
              : React.createElement(
                  'div',
                  {
                    className:
                      'empty-state small'
                  },
                  'Belum ada template cloud.'
                )
        )
    ),


    /* =====================================================
       HISTORY
    ===================================================== */

    history.length > 0 &&
      React.createElement(
        'section',
        {
          className:
            'history-section'
        },

        React.createElement(
          'div',
          {
            className:
              'section-kicker'
          },
          'RIWAYAT'
        ),

        React.createElement(
          'h2',
          null,
          'Pembagian sebelumnya'
        ),

        React.createElement(
          'div',
          {
            className:
              'history-list'
          },

          history.map(
            (item) =>
              React.createElement(
                'div',
                {
                  className:
                    'history-item',
                  key:
                    item.id
                },

                React.createElement(
                  'div',
                  null,
                  `${item.groups.length} kelompok`
                ),

                React.createElement(
                  'span',
                  null,
                  new Date(
                    item.createdAt
                  ).toLocaleTimeString(
                    'id-ID',
                    {
                      hour: '2-digit',
                      minute: '2-digit'
                    }
                  )
                )
              )
          )
        )
      ),


    /* =====================================================
       FOOTER
    ===================================================== */

    React.createElement(
      'footer',
      {
        className:
          'site-footer'
      },

      React.createElement(
        'div',
        null,
        'ArunikaMix • alat kecil untuk menyatukan orang'
      ),

      React.createElement(
        'div',
        {
          className:
            'footer-status'
        },
        'SUPABASE CLOUD ACTIVE'
      )
    ),


    /* =====================================================
       AUTH MODAL
    ===================================================== */

    showAuthModal &&
      React.createElement(
        'div',
        {
          className:
            'modal-backdrop',
          onMouseDown: (
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAuthModal(false);
            }
          }
        },

        React.createElement(
          'div',
          {
            className:
              'modal-card'
          },

          React.createElement(
            'button',
            {
              className:
                'modal-close',
              onClick: () =>
                setShowAuthModal(false)
            },

            React.createElement(
              Icon,
              {
                name: 'x',
                size: 18
              }
            )
          ),

          React.createElement(
            'div',
            {
              className:
                'section-kicker'
            },
            isSignUp
              ? 'BUAT AKUN'
              : 'MASUK'
          ),

          React.createElement(
            'h2',
            null,
            isSignUp
              ? 'Buat akun ArunikaMix'
              : 'Masuk ke ArunikaMix'
          ),

          React.createElement(
            'p',
            null,
            'Simpan daftar peserta dan template ',
            'agar bisa digunakan lagi.'
          ),

          React.createElement(
            'form',
            {
              onSubmit:
                handleAuth
            },

            React.createElement(
              'label',
              null,
              'Email',

              React.createElement(
                'input',
                {
                  type: 'email',
                  value:
                    authEmail,
                  onChange: (
                    event
                  ) =>
                    setAuthEmail(
                      event.target
                        .value
                    ),
                  placeholder:
                    'nama@email.com',
                  required: true
                }
              )
            ),

            React.createElement(
              'label',
              null,
              'Password',

              React.createElement(
                'input',
                {
                  type: 'password',
                  value:
                    authPassword,
                  onChange: (
                    event
                  ) =>
                    setAuthPassword(
                      event.target
                        .value
                    ),
                  placeholder:
                    '••••••••',
                  required: true,
                  minLength: 6
                }
              )
            ),

            React.createElement(
              'button',
              {
                type: 'submit',
                className:
                  'btn btn-primary full',
                disabled:
                  loadingCloud
              },
              loadingCloud
                ? 'Memproses...'
                : isSignUp
                  ? 'Daftar'
                  : 'Masuk'
            )
          ),

          React.createElement(
            'button',
            {
              className:
                'auth-switch',
              onClick: () =>
                setIsSignUp(
                  (current) =>
                    !current
                )
            },
            isSignUp
              ? 'Sudah punya akun? Masuk'
              : 'Belum punya akun? Daftar'
          )
        )
      ),


    /* =====================================================
       TEMPLATE MODAL
    ===================================================== */

    showTemplateModal &&
      React.createElement(
        'div',
        {
          className:
            'modal-backdrop',
          onMouseDown: (
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowTemplateModal(
                false
              );
            }
          }
        },

        React.createElement(
          'div',
          {
            className:
              'modal-card'
          },

          React.createElement(
            'button',
            {
              className:
                'modal-close',
              onClick: () =>
                setShowTemplateModal(
                  false
                )
            },

            React.createElement(
              Icon,
              {
                name: 'x',
                size: 18
              }
            )
          ),

          React.createElement(
            'div',
            {
              className:
                'section-kicker'
            },
            'CLOUD TEMPLATE'
          ),

          React.createElement(
            'h2',
            null,
            'Simpan daftar'
          ),

          React.createElement(
            'p',
            null,
            'Beri nama agar daftar ini mudah ditemukan.'
          ),

          React.createElement(
            'label',
            null,
            'Nama template',

            React.createElement(
              'input',
              {
                value:
                  templateName,
                onChange: (
                  event
                ) =>
                  setTemplateName(
                    event.target
                      .value
                  ),
                placeholder:
                  'Contoh: Kelas 8A'
              }
            )
          ),

          React.createElement(
            'button',
            {
              className:
                'btn btn-primary full',
              onClick:
                saveCloudTemplate,
              disabled:
                loadingCloud
            },
            loadingCloud
              ? 'Menyimpan...'
              : 'Simpan template'
          )
        )
      ),


    /* =====================================================
       TOAST
    ===================================================== */

    toast &&
      React.createElement(
        'div',
        {
          className:
            'toast-notice'
        },
        toast
      )
  );
}


/* =========================================================
   MOUNT APP
========================================================= */

const rootElement =
  document.getElementById('root');

if (rootElement) {
  const root =
    ReactDOM.createRoot(
      rootElement
    );

  root.render(
    React.createElement(App)
  );
} else {
  console.error(
    'Elemen #root tidak ditemukan.'
  );
    }
