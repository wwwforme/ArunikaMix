/* =========================================================
   ARUNIKAMIX
   Random Group & Mini Games
   React 18 + Supabase
   ========================================================= */

const {
  useState,
  useEffect,
  useMemo,
  useCallback
} = React;

const {
  Users,
  Plus,
  Trash2,
  RotateCcw,
  Shuffle,
  Copy,
  Check,
  Pencil,
  X,
  Save,
  Sparkles,
  Trophy,
  Swords,
  ListOrdered,
  CircleUserRound,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Lock,
  Mail,
  UserPlus,
  ChevronRight,
  RotateCw,
  Crown,
  ArrowRight,
  Settings,
  History,
  Trash,
  Upload,
  Download,
  MoreHorizontal
} = lucide;


/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  "https://hldsxluraxvsxscjfbqf.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodWxzZGxlcnV4c3h0c2pmYnFmIiwicmVmIjoiYW5vbiIsImlhdCI6MTY5NTY0NTgzOCwiZXhwIjoxNjk1NjQ1ODM4fQ";

let supabaseClient = null;

try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }
} catch (error) {
  console.warn("Supabase tidak tersedia:", error);
}


/* =========================================================
   DATA AWAL
   ========================================================= */

const ORIGINAL_PARTICIPANTS = [
  "Agung Pranaja",
  "Aina Salsabil",
  "Ainul Mardhiah",
  "Azfar Syahmi Al Akbar",
  "Fhyan Farikha Andi",
  "Iffanda Putri Vallendini",
  "Kansya Asqira Madhani Alam",
  "Khayla Eka Anugerah",
  "La Ode Abdul Raja Mananti",
  "La Ode Muhammad Syaban Hasnan",
  "Mahira Hasna Kamila Mustam",
  "Muh. Nur Alim",
  "Muhammad Fajar Ayyatullah An Nur",
  "Naizar Al Azmi K",
  "Nanda Saputri",
  "Nur Zahwa Syarifuddin",
  "Nurul Mutmainnah",
  "Oriza Putri Virany H.",
  "Raslan Syarsid",
  "Rasya Muhammad Athaya",
  "Sahlaa Zahidah Hawwaa M.",
  "Wa Ode Dini Dzakirah Lukman",
  "Wa Ode Kamalia Putri",
  "Wa Ode Ibnaty Nurul Aini S.",
  "Waldan Risallah Ampaeja",
  "Wa Ode Zalni Nining Pratiwi",
  "Zaim Andrias Adhimukti",
  "Zakiyah Khoirunnisa"
];

const GROUP_COLORS = [
  "#EE806C",
  "#EDB949",
  "#4C9382",
  "#4B334D",
  "#78A8C8",
  "#D77A9B",
  "#78A890",
  "#B28B54"
];

const GROUP_NAMES = [
  "Coral",
  "Saffron",
  "Teal",
  "Plum",
  "Sky",
  "Rose",
  "Mint",
  "Ochre"
];

const TABS = [
  {
    id: "groups",
    label: "Pembagi Kelompok",
    icon: Users
  },
  {
    id: "wheel",
    label: "Roda Putar",
    icon: RotateCw
  },
  {
    id: "duel",
    label: "Undian Berpasangan",
    icon: Swords
  },
  {
    id: "queue",
    label: "Urutan Antrean",
    icon: ListOrdered
  }
];


/* =========================================================
   UTILITIES
   ========================================================= */

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i]
    ];
  }

  return result;
}

function createParticipant(name) {
  return {
    id: randomId(),
    name: name.trim()
  };
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function getShortName(name) {
  if (!name) return "";

  const parts = name.split(" ");

  if (parts.length <= 2) return name;

  return `${parts[0]} ${parts[1]}`;
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    return Promise.reject(
      new Error("Clipboard tidak tersedia")
    );
  }

  return navigator.clipboard.writeText(text);
}


/* =========================================================
   ICON COMPONENT
   ========================================================= */

function Icon({
  icon: IconComponent,
  size = 18,
  strokeWidth = 2,
  className = ""
}) {
  if (!IconComponent) return null;

  return React.createElement(IconComponent, {
    size,
    strokeWidth,
    className
  });
}


/* =========================================================
   TOAST
   ========================================================= */

function Toast({
  message,
  onClose
}) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return React.createElement(
    "div",
    {
      className: "toast-notice"
    },
    React.createElement(
      Icon,
      {
        icon: Check,
        size: 16
      }
    ),
    React.createElement(
      "span",
      null,
      message
    )
  );
}


/* =========================================================
   BRAND
   ========================================================= */

function Brand() {
  return React.createElement(
    "div",
    {
      className: "brand-lockup"
    },

    React.createElement(
      "div",
      {
        className: "brand-mark"
      },

      React.createElement("span", {
        style: {
          transform: "rotate(-8deg)"
        }
      }),

      React.createElement("span", {
        style: {
          transform: "rotate(5deg)"
        }
      }),

      React.createElement("span", {
        style: {
          transform: "rotate(-12deg)"
        }
      })
    ),

    React.createElement(
      "span",
      null,
      "ArunikaMix"
    )
  );
}


/* =========================================================
   HERO
   ========================================================= */

function Hero({
  participantCount
}) {
  return React.createElement(
    "section",
    {
      className: "hero-wrap"
    },

    React.createElement(
      "div",
      {
        className: "hero-copy"
      },

      React.createElement(
        Brand
      ),

      React.createElement(
        "h1",
        {
          style: {
            fontFamily: "var(--font-sans)",
            fontSize: "38px",
            fontWeight: 700,
            letterSpacing: "-1.2px",
            lineHeight: 1.12,
            marginTop: "18px"
          }
        },
        "Beri ruang ",
        React.createElement(
          "em",
          {
            style: {
              color: "var(--coral-deep)",
              fontStyle: "italic"
            }
          },
          "untuk kejutan."
        )
      ),

      React.createElement(
        "p",
        {
          className: "hero-description"
        },
        "Pembagi kelompok acak dan mini games ",
        "untuk membuat pembagian terasa lebih adil, ",
        "lebih cepat, dan sedikit lebih seru."
      )
    ),

    React.createElement(
      "div",
      {
        className: "hero-stamp"
      },

      React.createElement(
        "div",
        {
          className: "stamp-number",
          style: {
            fontSize: "32px"
          }
        },
        participantCount
      ),

      React.createElement(
        "div",
        {
          className: "stamp-caption",
          style: {
            fontSize: "11px"
          }
        },
        "orang di dalamnya"
      ),

      React.createElement(
        "div",
        {
          className: "stamp-line"
        }
      ),

      React.createElement(
        "div",
        {
          className: "stamp-caption"
        },
        "satu titik awal yang adil"
      )
    )
  );
}


/* =========================================================
   TAB NAVIGATION
   ========================================================= */

function TabNavigation({
  activeTab,
  setActiveTab
}) {
  return React.createElement(
    "nav",
    {
      className: "tab-navigation"
    },

    TABS.map(tab => {
      const active = activeTab === tab.id;

      return React.createElement(
        "button",
        {
          key: tab.id,
          className:
            "tab-button" +
            (active ? " active" : ""),
          onClick: () => setActiveTab(tab.id)
        },

        React.createElement(
          Icon,
          {
            icon: tab.icon,
            size: 17
          }
        ),

        React.createElement(
          "span",
          null,
          tab.label
        )
      );
    })
  );
}


/* =========================================================
   PARTICIPANT INPUT
   ========================================================= */

function ParticipantInput({
  participants,
  setParticipants,
  showNotice
}) {
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  function addParticipants() {
    const names = value
      .split("\n")
      .map(name => name.trim())
      .filter(Boolean);

    if (!names.length) {
      showNotice("Tulis setidaknya satu nama.");
      return;
    }

    const newParticipants = names.map(
      createParticipant
    );

    setParticipants(prev => [
      ...prev,
      ...newParticipants
    ]);

    setValue("");

    showNotice(
      `${names.length} peserta ditambahkan.`
    );
  }

  function removeParticipant(id) {
    setParticipants(prev =>
      prev.filter(
        participant => participant.id !== id
      )
    );
  }

  function startEditing(participant) {
    setEditingId(participant.id);
    setEditingValue(participant.name);
  }

  function saveEditing(id) {
    const cleanName = editingValue.trim();

    if (!cleanName) {
      showNotice("Nama tidak boleh kosong.");
      return;
    }

    setParticipants(prev =>
      prev.map(participant =>
        participant.id === id
          ? {
              ...participant,
              name: cleanName
            }
          : participant
      )
    );

    setEditingId(null);
    setEditingValue("");

    showNotice("Nama berhasil diperbarui.");
  }

  function resetParticipants() {
    setParticipants(
      ORIGINAL_PARTICIPANTS.map(
        createParticipant
      )
    );

    showNotice(
      "Daftar peserta dikembalikan ke awal."
    );
  }

  function clearParticipants() {
    if (!participants.length) return;

    setParticipants([]);

    showNotice("Semua peserta dihapus.");
  }

  return React.createElement(
    "section",
    {
      className: "participant-panel"
    },

    React.createElement(
      "div",
      {
        className: "panel-heading"
      },

      React.createElement(
        "div",
        null,

        React.createElement(
          "h2",
          null,
          "Daftar Peserta"
        ),

        React.createElement(
          "p",
          null,
          "Tambahkan nama satu per baris."
        )
      ),

      React.createElement(
        "span",
        {
          className: "count-pill"
        },
        participants.length
      )
    ),

    React.createElement(
      "div",
      {
        className: "participant-input"
      },

      React.createElement(
        "textarea",
        {
          value,
          onChange: e =>
            setValue(e.target.value),
          placeholder:
            "Contoh:\nAlya\nBima\nCitra",
          rows: 4
        }
      ),

      React.createElement(
        "button",
        {
          className: "primary-button",
          onClick: addParticipants
        },

        React.createElement(
          Icon,
          {
            icon: Plus,
            size: 17
          }
        ),

        "Tambah"
      )
    ),

    React.createElement(
      "div",
      {
        className: "participant-actions"
      },

      React.createElement(
        "button",
        {
          className: "text-button",
          onClick: resetParticipants
        },

        React.createElement(
          Icon,
          {
            icon: RotateCcw,
            size: 15
          }
        ),

        "Reset awal"
      ),

      React.createElement(
        "button",
        {
          className: "text-button danger",
          onClick: clearParticipants
        },

        React.createElement(
          Icon,
          {
            icon: Trash2,
            size: 15
          }
        ),

        "Hapus semua"
      )
    ),

    React.createElement(
      "div",
      {
        className: "participant-list"
      },

      participants.length === 0
        ? React.createElement(
            "div",
            {
              className: "empty-state"
            },

            React.createElement(
              Icon,
              {
                icon: Users,
                size: 30
              }
            ),

            React.createElement(
              "p",
              null,
              "Belum ada peserta."
            )
          )

        : participants.map(
            (participant, index) =>
              React.createElement(
                "div",
                {
                  className: "participant-row",
                  key: participant.id
                },

                React.createElement(
                  "span",
                  {
                    className:
                      "participant-index"
                  },
                  String(index + 1).padStart(
                    2,
                    "0"
                  )
                ),

                React.createElement(
                  "div",
                  {
                    className:
                      "participant-avatar"
                  },
                  getInitials(
                    participant.name
                  )
                ),

                editingId === participant.id
                  ? React.createElement(
                      "input",
                      {
                        className:
                          "participant-edit",
                        value: editingValue,
                        autoFocus: true,
                        onChange: e =>
                          setEditingValue(
                            e.target.value
                          ),
                        onKeyDown: e => {
                          if (
                            e.key === "Enter"
                          ) {
                            saveEditing(
                              participant.id
                            );
                          }

                          if (
                            e.key === "Escape"
                          ) {
                            setEditingId(null);
                          }
                        }
                      }
                    )

                  : React.createElement(
                      "span",
                      {
                        className:
                          "participant-name"
                      },
                      participant.name
                    ),

                React.createElement(
                  "div",
                  {
                    className:
                      "participant-row-actions"
                  },

                  editingId ===
                  participant.id

                    ? React.createElement(
                        "button",
                        {
                          className:
                            "icon-button",
                          onClick: () =>
                            saveEditing(
                              participant.id
                            )
                        },
                        React.createElement(
                          Icon,
                          {
                            icon: Save,
                            size: 16
                          }
                        )
                      )

                    : React.createElement(
                        "button",
                        {
                          className:
                            "icon-button",
                          onClick: () =>
                            startEditing(
                              participant
                            )
                        },
                        React.createElement(
                          Icon,
                          {
                            icon: Pencil,
                            size: 16
                          }
                        )
                      ),

                  React.createElement(
                    "button",
                    {
                      className:
                        "icon-button danger",
                      onClick: () =>
                        removeParticipant(
                          participant.id
                        )
                    },

                    React.createElement(
                      Icon,
                      {
                        icon: X,
                        size: 16
                      }
                    )
                  )
                )
              )
          )
    )
  );
}


/* =========================================================
   GROUP RESULT
   ========================================================= */

function GroupCard({
  group,
  index,
  onCopy
}) {
  const color =
    GROUP_COLORS[
      index % GROUP_COLORS.length
    ];

  return React.createElement(
    "article",
    {
      className: "group-card"
    },

    React.createElement(
      "div",
      {
        className: "group-card-header"
      },

      React.createElement(
        "div",
        {
          className: "group-title-wrap"
        },

        React.createElement(
          "span",
          {
            className: "group-dot",
            style: {
              background: color
            }
          }
        ),

        React.createElement(
          "div",
          null,

          React.createElement(
            "span",
            {
              className: "group-number"
            },
            `KELOMPOK ${index + 1}`
          ),

          React.createElement(
            "h3",
            null,
            GROUP_NAMES[
              index % GROUP_NAMES.length
            ]
          )
        )
      ),

      React.createElement(
        "button",
        {
          className: "icon-button",
          onClick: () => onCopy(group)
        },

        React.createElement(
          Icon,
          {
            icon: Copy,
            size: 15
          }
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "group-members"
      },

      group.map((person, personIndex) =>
        React.createElement(
          "div",
          {
            className: "group-member",
            key:
              person.id ||
              `${person.name}-${personIndex}`
          },

          React.createElement(
            "span",
            {
              className: "member-number"
            },
            String(personIndex + 1).padStart(
              2,
              "0"
            )
          ),

          React.createElement(
            "span",
            null,
            person.name
          )
        )
      )
    )
  );
}


/* =========================================================
   GROUP GENERATOR
   ========================================================= */

function GroupGenerator({
  participants,
  showNotice,
  history,
  setHistory
}) {
  const [groupCount, setGroupCount] =
    useState(4);

  const [groups, setGroups] =
    useState([]);

  const [isShuffling, setIsShuffling] =
    useState(false);

  function generateGroups() {
    if (participants.length < 2) {
      showNotice(
        "Tambahkan minimal 2 peserta."
      );
      return;
    }

    if (
      groupCount < 1 ||
      groupCount > participants.length
    ) {
      showNotice(
        "Jumlah kelompok tidak valid."
      );
      return;
    }

    setIsShuffling(true);

    setTimeout(() => {
      const shuffled =
        shuffleArray(participants);

      const result = Array.from(
        {
          length: groupCount
        },
        () => []
      );

      shuffled.forEach(
        (person, index) => {
          result[
            index % groupCount
          ].push(person);
        }
      );

      setGroups(result);

      setHistory(prev => [
        {
          id: randomId(),
          type: "groups",
          timestamp: Date.now(),
          groups: result
        },
        ...prev
      ].slice(0, 10));

      setIsShuffling(false);

      showNotice(
        "Kelompok baru berhasil diacak."
      );
    }, 350);
  }

  function copyGroup(group) {
    const text = group
      .map(person => person.name)
      .join("\n");

    copyToClipboard(text)
      .then(() =>
        showNotice(
          "Daftar kelompok disalin."
        )
      )
      .catch(() =>
        showNotice(
          "Gagal menyalin daftar."
        )
      );
  }

  function copyAllGroups() {
    if (!groups.length) return;

    const text = groups
      .map(
        (group, index) =>
          `KELOMPOK ${index + 1}\n` +
          group
            .map(person => `• ${person.name}`)
            .join("\n")
      )
      .join("\n\n");

    copyToClipboard(text)
      .then(() =>
        showNotice(
          "Semua kelompok disalin."
        )
      )
      .catch(() =>
        showNotice(
          "Gagal menyalin kelompok."
        )
      );
  }

  return React.createElement(
    "section",
    {
      className: "tool-section"
    },

    React.createElement(
      "div",
      {
        className: "tool-header"
      },

      React.createElement(
        "div",
        null,

        React.createElement(
          "span",
          {
            className: "eyebrow"
          },
          "RANDOMIZER"
        ),

        React.createElement(
          "h2",
          null,
          "Bagi kelompok tanpa drama."
        ),

        React.createElement(
          "p",
          null,
          "ArunikaMix mencoba membuat pembagian ",
          "seimbang tanpa perlu menentukan siapa ",
          "dengan siapa."
        )
      ),

      React.createElement(
        "div",
        {
          className: "tool-control"
        },

        React.createElement(
          "label",
          null,
          "Jumlah kelompok"
        ),

        React.createElement(
          "div",
          {
            className: "number-control"
          },

          React.createElement(
            "button",
            {
              onClick: () =>
                setGroupCount(
                  Math.max(
                    1,
                    groupCount - 1
                  )
                )
            },
            "−"
          ),

          React.createElement(
            "strong",
            null,
            groupCount
          ),

          React.createElement(
            "button",
            {
              onClick: () =>
                setGroupCount(
                  Math.min(
                    participants.length || 1,
                    groupCount + 1
                  )
                )
            },
            "+"
          )
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "shuffle-action"
      },

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick: generateGroups,
          disabled:
            isShuffling ||
            participants.length < 2
        },

        React.createElement(
          Icon,
          {
            icon: Shuffle,
            size: 19
          }
        ),

        isShuffling
          ? "Mengacak..."
          : "Acak kelompok"
      ),

      groups.length > 0 &&
        React.createElement(
          "button",
          {
            className: "secondary-button",
            onClick: copyAllGroups
          },

          React.createElement(
            Icon,
            {
              icon: Copy,
              size: 16
            }
          ),

          "Salin semua"
        )
    ),

    groups.length > 0
      ? React.createElement(
          "div",
          {
            className: "groups-grid"
          },

          groups.map(
            (group, index) =>
              React.createElement(
                GroupCard,
                {
                  key: index,
                  group,
                  index,
                  onCopy: copyGroup
                }
              )
          )
        )

      : React.createElement(
          "div",
          {
            className: "result-placeholder"
          },

          React.createElement(
            Icon,
            {
              icon: Sparkles,
              size: 28
            }
          ),

          React.createElement(
            "h3",
            null,
            "Belum ada hasil."
          ),

          React.createElement(
            "p",
            null,
            "Tekan tombol acak dan biarkan ",
            "ArunikaMix memilihkan."
          )
        )
  );
}


/* =========================================================
   WHEEL
   ========================================================= */

function Wheel({
  participants,
  showNotice
}) {
  const [remaining, setRemaining] =
    useState(participants);

  const [winner, setWinner] =
    useState(null);

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  useEffect(() => {
    setRemaining(participants);
  }, [participants]);

  const segmentCount =
    Math.max(remaining.length, 1);

  const segmentAngle =
    360 / segmentCount;

  function spin() {
    if (spinning) return;

    if (!remaining.length) {
      showNotice(
        "Tidak ada peserta tersisa."
      );
      return;
    }

    setSpinning(true);
    setWinner(null);

    const winnerIndex =
      Math.floor(
        Math.random() * remaining.length
      );

    const extraTurns =
      5 + Math.floor(Math.random() * 3);

    const targetRotation =
      rotation +
      extraTurns * 360 +
      (360 -
        winnerIndex * segmentAngle -
        segmentAngle / 2);

    setRotation(targetRotation);

    setTimeout(() => {
      const selected =
        remaining[winnerIndex];

      setWinner(selected);
      setSpinning(false);

      showNotice(
        `${selected.name} terpilih!`
      );
    }, 3500);
  }

  function removeWinner() {
    if (!winner) return;

    setRemaining(prev =>
      prev.filter(
        person =>
          person.id !== winner.id
      )
    );

    showNotice(
      `${winner.name} dikeluarkan dari roda.`
    );

    setWinner(null);
  }

  return React.createElement(
    "section",
    {
      className: "wheel-section"
    },

    React.createElement(
      "div",
      {
        className: "wheel-info"
      },

      React.createElement(
        "span",
        {
          className: "eyebrow"
        },
        "SPIN WHEEL"
      ),

      React.createElement(
        "h2",
        null,
        "Siapa yang kena giliran?"
      ),

      React.createElement(
        "p",
        null,
        "Biarkan roda memilih secara acak."
      )
    ),

    React.createElement(
      "div",
      {
        className: "wheel-stage"
      },

      React.createElement(
        "div",
        {
          className: "wheel-pointer"
        }
      ),

      React.createElement(
        "div",
        {
          className: "wheel",
          style: {
            transform: `rotate(${rotation}deg)`,
            transition:
              spinning
                ? "transform 3.5s cubic-bezier(.12,.7,.15,1)"
                : "none"
          }
        },

        remaining.length === 0

          ? React.createElement(
              "div",
              {
                className: "wheel-empty"
              },
              "SELESAI"
            )

          : remaining.map(
              (person, index) =>
                React.createElement(
                  "div",
                  {
                    key: person.id,
                    className:
                      "wheel-segment",
                    style: {
                      "--segment-angle":
                        `${segmentAngle}deg`,
                      "--segment-index":
                        index,
                      background:
                        GROUP_COLORS[
                          index %
                            GROUP_COLORS.length
                        ]
                    }
                  },

                  React.createElement(
                    "span",
                    null,
                    getShortName(
                      person.name
                    )
                  )
                )
            )
      ),

      React.createElement(
        "div",
        {
          className: "wheel-center"
        },

        React.createElement(
          "span",
          null,
          remaining.length
        ),

        React.createElement(
          "small",
          null,
          "tersisa"
        )
      )
    ),

    winner &&
      React.createElement(
        "div",
        {
          className: "winner-card"
        },

        React.createElement(
          "span",
          {
            className: "eyebrow"
          },
          "HASIL"
        ),

        React.createElement(
          "strong",
          null,
          winner.name
        ),

        React.createElement(
          "div",
          {
            className: "winner-actions"
          },

          React.createElement(
            "button",
            {
              className: "primary-button",
              onClick: removeWinner
            },

            React.createElement(
              Icon,
              {
                icon: Trash,
                size: 15
              }
            ),

            "Hapus dari roda"
          ),

          React.createElement(
            "button",
            {
              className:
                "secondary-button",
              onClick: spin
            },
            "Putar lagi"
          )
        )
      ),

    React.createElement(
      "button",
      {
        className:
          "primary-button large wheel-button",
        onClick: spin,
        disabled:
          spinning ||
          remaining.length === 0
      },

      React.createElement(
        Icon,
        {
          icon: RotateCw,
          size: 19
        }
      ),

      spinning
        ? "Roda berputar..."
        : "Putar roda"
    )
  );
}


/* =========================================================
   DUEL
   ========================================================= */

function Duel({
  participants,
  showNotice
}) {
  const [pairs, setPairs] =
    useState([]);

  const [hasOdd, setHasOdd] =
    useState(false);

  function createDuels() {
    if (participants.length < 2) {
      showNotice(
        "Tambahkan minimal 2 peserta."
      );
      return;
    }

    const shuffled =
      shuffleArray(participants);

    const result = [];

    for (
      let i = 0;
      i < shuffled.length - 1;
      i += 2
    ) {
      result.push([
        shuffled[i],
        shuffled[i + 1]
      ]);
    }

    setPairs(result);
    setHasOdd(
      shuffled.length % 2 !== 0
    );

    showNotice(
      "Pasangan berhasil diacak."
    );
  }

  return React.createElement(
    "section",
    {
      className: "tool-section"
    },

    React.createElement(
      "div",
      {
        className: "tool-header"
      },

      React.createElement(
        "div",
        null,

        React.createElement(
          "span",
          {
            className: "eyebrow"
          },
          "DUEL MODE"
        ),

        React.createElement(
          "h2",
          null,
          "Pasangkan secara acak."
        ),

        React.createElement(
          "p",
          null,
          "Cocok untuk menentukan pasangan ",
          "presentasi, permainan, atau tantangan."
        )
      )
    ),

    React.createElement(
      "button",
      {
        className:
          "primary-button large",
        onClick: createDuels
      },

      React.createElement(
        Icon,
        {
          icon: Swords,
          size: 19
        }
      ),

      "Acak pasangan"
    ),

    pairs.length > 0 &&
      React.createElement(
        "div",
        {
          className: "duel-grid"
        },

        pairs.map(
          (pair, index) =>
            React.createElement(
              "div",
              {
                className: "duel-card",
                key: index
              },

              React.createElement(
                "span",
                {
                  className:
                    "duel-number"
                },
                String(index + 1).padStart(
                  2,
                  "0"
                )
              ),

              React.createElement(
                "div",
                {
                  className:
                    "duel-person"
                },

                React.createElement(
                  "div",
                  {
                    className:
                      "participant-avatar"
                  },
                  getInitials(
                    pair[0].name
                  )
                ),

                React.createElement(
                  "strong",
                  null,
                  pair[0].name
                )
              ),

              React.createElement(
                "div",
                {
                  className: "duel-vs"
                },
                "VS"
              ),

              React.createElement(
                "div",
                {
                  className:
                    "duel-person"
                },

                React.createElement(
                  "div",
                  {
                    className:
                      "participant-avatar"
                  },
                  getInitials(
                    pair[1].name
                  )
                ),

                React.createElement(
                  "strong",
                  null,
                  pair[1].name
                )
              )
            )
        )
      ),

    hasOdd &&
      React.createElement(
        "p",
        {
          className: "odd-note"
        },
        "Jumlah peserta ganjil, jadi satu orang tidak mendapat pasangan."
      )
  );
}


/* =========================================================
   QUEUE
   ========================================================= */

function Queue({
  participants,
  showNotice
}) {
  const [queue, setQueue] =
    useState([]);

  function randomizeQueue() {
    if (!participants.length) {
      showNotice(
        "Belum ada peserta."
      );
      return;
    }

    setQueue(
      shuffleArray(participants)
    );

    showNotice(
      "Urutan antrean berhasil diacak."
    );
  }

  function copyQueue() {
    const text = queue
      .map(
        (person, index) =>
          `${index + 1}. ${person.name}`
      )
      .join("\n");

    copyToClipboard(text)
      .then(() =>
        showNotice(
          "Urutan antrean disalin."
        )
      )
      .catch(() =>
        showNotice(
          "Gagal menyalin antrean."
        )
      );
  }

  return React.createElement(
    "section",
    {
      className: "tool-section"
    },

    React.createElement(
      "div",
      {
        className: "tool-header"
      },

      React.createElement(
        "div",
        null,

        React.createElement(
          "span",
          {
            className: "eyebrow"
          },
          "QUEUE"
        ),

        React.createElement(
          "h2",
          null,
          "Siapa duluan?"
        ),

        React.createElement(
          "p",
          null,
          "Acak urutan presentasi, tampil, ",
          "atau giliran lainnya."
        )
      )
    ),

    React.createElement(
      "div",
      {
        className: "queue-actions"
      },

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick: randomizeQueue
        },

        React.createElement(
          Icon,
          {
            icon: Shuffle,
            size: 19
          }
        ),

        "Acak urutan"
      ),

      queue.length > 0 &&
        React.createElement(
          "button",
          {
            className:
              "secondary-button",
            onClick: copyQueue
          },

          React.createElement(
            Icon,
            {
              icon: Copy,
              size: 16
            }
          ),

          "Salin"
        )
    ),

    queue.length > 0
      ? React.createElement(
          "div",
          {
            className: "queue-list"
          },

          queue.map(
            (person, index) =>
              React.createElement(
                "div",
                {
                  className:
                    "queue-item",
                  key: person.id
                },

                React.createElement(
                  "span",
                  {
                    className:
                      "queue-position"
                  },
                  String(index + 1).padStart(
                    2,
                    "0"
                  )
                ),

                React.createElement(
                  "div",
                  {
                    className:
                      "participant-avatar"
                  },
                  getInitials(
                    person.name
                  )
                ),

                React.createElement(
                  "span",
                  null,
                  person.name
                ),

                index === 0 &&
                  React.createElement(
                    "span",
                    {
                      className:
                        "queue-badge"
                    },
                    "PERTAMA"
                  )
              )
          )
        )

      : React.createElement(
          "div",
          {
            className:
              "result-placeholder"
          },

          React.createElement(
            Icon,
            {
              icon: ListOrdered,
              size: 28
            }
          ),

          React.createElement(
            "h3",
            null,
            "Antrean belum dibuat."
          ),

          React.createElement(
            "p",
            null,
            "Acak untuk mendapatkan urutan baru."
          )
        )
  );
}


/* =========================================================
   HISTORY
   ========================================================= */

function HistoryPanel({
  history,
  setHistory
}) {
  if (!history.length) {
    return null;
  }

  function clearHistory() {
    setHistory([]);
  }

  return React.createElement(
    "section",
    {
      className: "history-section"
    },

    React.createElement(
      "div",
      {
        className: "history-header"
      },

      React.createElement(
        "div",
        null,

        React.createElement(
          "span",
          {
            className: "eyebrow"
          },
          "RECENT"
        ),

        React.createElement(
          "h2",
          null,
          "Jejak pengacakan"
        )
      ),

      React.createElement(
        "button",
        {
          className: "text-button danger",
          onClick: clearHistory
        },

        React.createElement(
          Icon,
          {
            icon: Trash,
            size: 15
          }
        ),

        "Bersihkan"
      )
    ),

    React.createElement(
      "div",
      {
        className: "history-list"
      },

      history.map(item =>
        React.createElement(
          "div",
          {
            className:
              "history-item",
            key: item.id
          },

          React.createElement(
            Icon,
            {
              icon: History,
              size: 16
            }
          ),

          React.createElement(
            "span",
            null,
            item.type === "groups"
              ? `${item.groups.length} kelompok`
              : "Pengacakan"
          ),

          React.createElement(
            "span",
            {
              className:
                "history-time"
            },
            new Date(
              item.timestamp
            ).toLocaleTimeString(
              "id-ID",
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            )
          )
        )
      )
    )
  );
}


/* =========================================================
   AUTH MODAL
   ========================================================= */

function AuthModal({
  show,
  onClose,
  showNotice,
  onLoginSuccess
}) {
  const [isSignUp, setIsSignUp] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (!show) return null;

  async function handleAuth(e) {
    e.preventDefault();

    if (!supabaseClient) {
      showNotice(
        "Cloud belum tersedia."
      );
      return;
    }

    if (!email || !password) {
      showNotice(
        "Email dan password wajib diisi."
      );
      return;
    }

    if (password.length < 6) {
      showNotice(
        "Password minimal 6 karakter."
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const redirectUrl =
          window.location.origin +
          window.location.pathname;

        const {
          error
        } =
          await supabaseClient.auth.signUp(
            {
              email,
              password,
              options: {
                emailRedirectTo:
                  redirectUrl
              }
            }
          );

        if (error) {
          showNotice(
            error.message
          );
        } else {
          showNotice(
            "Pendaftaran berhasil. Cek email untuk konfirmasi."
          );

          setIsSignUp(false);
        }
      } else {
        const {
          data,
          error
        } =
          await supabaseClient.auth
            .signInWithPassword({
              email,
              password
            });

        if (error) {
          showNotice(
            error.message
          );
        } else {
          showNotice(
            "Berhasil masuk akun."
          );

          onLoginSuccess(
            data.user
          );

          onClose();
        }
      }
    } catch (error) {
      console.error(error);

      showNotice(
        "Terjadi kesalahan. Coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return React.createElement(
    "div",
    {
      className: "modal-backdrop",
      onMouseDown: e => {
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }
      }
    },

    React.createElement(
      "div",
      {
        className: "auth-modal"
      },

      React.createElement(
        "button",
        {
          className:
            "modal-close",
          onClick: onClose
        },

        React.createElement(
          Icon,
          {
            icon: X,
            size: 18
          }
        )
      ),

      React.createElement(
        "div",
        {
          className:
            "auth-icon"
        },

        React.createElement(
          Icon,
          {
            icon: isSignUp
              ? UserPlus
              : LogIn,
            size: 22
          }
        )
      ),

      React.createElement(
        "h2",
        null,
        isSignUp
          ? "Buat akun ArunikaMix"
          : "Masuk ke ArunikaMix"
      ),

      React.createElement(
        "p",
        null,
        isSignUp
          ? "Simpan template dan pengaturanmu di cloud."
          : "Lanjutkan menggunakan template cloud-mu."
      ),

      React.createElement(
        "form",
        {
          onSubmit: handleAuth
        },

        React.createElement(
          "label",
          null,
          "Email"
        ),

        React.createElement(
          "div",
          {
            className:
              "auth-input-wrap"
          },

          React.createElement(
            Icon,
            {
              icon: Mail,
              size: 16
            }
          ),

          React.createElement(
            "input",
            {
              type: "email",
              value: email,
              onChange: e =>
                setEmail(
                  e.target.value
                ),
              placeholder:
                "nama@email.com"
            }
          )
        ),

        React.createElement(
          "label",
          null,
          "Password"
        ),

        React.createElement(
          "div",
          {
            className:
              "auth-input-wrap"
          },

          React.createElement(
            Icon,
            {
              icon: Lock,
              size: 16
            }
          ),

          React.createElement(
            "input",
            {
              type: "password",
              value: password,
              onChange: e =>
                setPassword(
                  e.target.value
                ),
              placeholder:
                "Minimal 6 karakter"
            }
          )
        ),

        React.createElement(
          "button",
          {
            className:
              "primary-button full",
            type: "submit",
            disabled: loading
          },

          loading
            ? "Memproses..."
            : isSignUp
            ? "Daftar akun"
            : "Masuk"
        )
      ),

      React.createElement(
        "button",
        {
          className:
            "auth-switch",
          onClick: () =>
            setIsSignUp(
              prev => !prev
            )
        },

        isSignUp
          ? "Sudah punya akun? Masuk"
          : "Belum punya akun? Daftar"
      )
    )
  );
}


/* =========================================================
   CLOUD STATUS
   ========================================================= */

function CloudStatus({
  user,
  onLogin,
  onLogout
}) {
  return React.createElement(
    "div",
    {
      className:
        "cloud-status"
    },

    React.createElement(
      Icon,
      {
        icon: user
          ? Cloud
          : CloudOff,
        size: 15
      }
    ),

    React.createElement(
      "span",
      null,
      user
        ? user.email
        : "Cloud tidak aktif"
    ),

    user
      ? React.createElement(
          "button",
          {
            onClick: onLogout
          },
          React.createElement(
            Icon,
            {
              icon: LogOut,
              size: 14
            }
          )
        )

      : React.createElement(
          "button",
          {
            onClick: onLogin
          },
          "Masuk"
        )
  );
}


/* =========================================================
   MAIN APP
   ========================================================= */

function App() {
  const [
    participants,
    setParticipants
  ] = useState(() =>
    ORIGINAL_PARTICIPANTS.map(
      createParticipant
    )
  );

  const [
    activeTab,
    setActiveTab
  ] = useState("groups");

  const [
    history,
    setHistory
  ] = useState([]);

  const [
    notice,
    setNotice
  ] = useState("");

  const [
    user,
    setUser
  ] = useState(null);

  const [
    showAuth,
    setShowAuth
  ] = useState(false);

  const [
    templates,
    setTemplates
  ] = useState([]);

  const showNotice =
    useCallback(message => {
      setNotice(message);
    }, []);

  /* -------------------------------------------------------
     SUPABASE SESSION
     ------------------------------------------------------- */

  useEffect(() => {
    if (!supabaseClient) return;

    let mounted = true;

    supabaseClient.auth
      .getSession()
      .then(({ data }) => {
        if (
          mounted &&
          data.session?.user
        ) {
          setUser(
            data.session.user
          );
        }
      });

    const {
      data: listener
    } =
      supabaseClient.auth.onAuthStateChange(
        (_event, session) => {
          if (!mounted) return;

          setUser(
            session?.user || null
          );
        }
      );

    return () => {
      mounted = false;

      listener?.subscription?.unsubscribe();
    };
  }, []);


  /* -------------------------------------------------------
     CLOUD TEMPLATE
     ------------------------------------------------------- */

  async function fetchTemplates() {
    if (!supabaseClient || !user) {
      return;
    }

    try {
      const {
        data,
        error
      } =
        await supabaseClient
          .from("templates")
          .select("*")
          .eq("user_id", user.id)
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) {
        console.warn(error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.warn(error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchTemplates();
    } else {
      setTemplates([]);
    }
  }, [user]);


  async function saveAsTemplate() {
    if (!supabaseClient) {
      showNotice(
        "Cloud belum tersedia."
      );
      return;
    }

    if (!user) {
      setShowAuth(true);

      showNotice(
        "Masuk terlebih dahulu untuk menyimpan template."
      );

      return;
    }

    const name =
      prompt(
        "Nama template:"
      );

    if (!name?.trim()) {
      return;
    }

    try {
      const {
        data,
        error
      } =
        await supabaseClient
          .from("templates")
          .insert({
            user_id: user.id,
            name: name.trim(),
            participants:
              participants.map(
                person =>
                  person.name
              )
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      setTemplates(prev => [
        data,
        ...prev
      ]);

      showNotice(
        "Template berhasil disimpan."
      );
    } catch (error) {
      console.error(error);

      showNotice(
        "Template gagal disimpan."
      );
    }
  }


  async function deleteTemplate(id) {
    if (!supabaseClient || !user) {
      return;
    }

    try {
      const {
        error
      } =
        await supabaseClient
          .from("templates")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTemplates(prev =>
        prev.filter(
          template =>
            template.id !== id
        )
      );

      showNotice(
        "Template dihapus."
      );
    } catch (error) {
      console.error(error);

      showNotice(
        "Template gagal dihapus."
      );
    }
  }


  function loadTemplate(template) {
    if (!template?.participants) {
      return;
    }

    setParticipants(
      template.participants.map(
        createParticipant
      )
    );

    setActiveTab("groups");

    showNotice(
      `Template "${template.name}" dimuat.`
    );
  }


  async function logout() {
    if (!supabaseClient) return;

    await supabaseClient.auth.signOut();

    setUser(null);

    showNotice(
      "Berhasil keluar."
    );
  }


  /* -------------------------------------------------------
     TEMPLATE PANEL
     ------------------------------------------------------- */

  function TemplatePanel() {
    return React.createElement(
      "section",
      {
        className:
          "template-section"
      },

      React.createElement(
        "div",
        {
          className:
            "template-header"
        },

        React.createElement(
          "div",
          null,

          React.createElement(
            "span",
            {
              className:
                "eyebrow"
            },
            "CLOUD"
          ),

          React.createElement(
            "h2",
            null,
            "Template milikmu."
          ),

          React.createElement(
            "p",
            null,
            user
              ? "Simpan daftar peserta yang sering kamu gunakan."
              : "Masuk untuk menyimpan template ke cloud."
          )
        ),

        React.createElement(
          "button",
          {
            className:
              "secondary-button",
            onClick:
              saveAsTemplate
          },

          React.createElement(
            Icon,
            {
              icon: Upload,
              size: 16
            }
          ),

          "Simpan template"
        )
      ),

      user &&
        templates.length > 0 &&

        React.createElement(
          "div",
          {
            className:
              "template-grid"
          },

          templates.map(
            template =>
              React.createElement(
                "div",
                {
                  className:
                    "template-card",
                  key: template.id
                },

                React.createElement(
                  "div",
                  null,

                  React.createElement(
                    "strong",
                    null,
                    template.name
                  ),

                  React.createElement(
                    "span",
                    null,
                    `${template.participants?.length || 0} peserta`
                  )
                ),

                React.createElement(
                  "div",
                  {
                    className:
                      "template-actions"
                  },

                  React.createElement(
                    "button",
                    {
                      className:
                        "icon-button",
                      onClick: () =>
                        loadTemplate(
                          template
                        )
                    },

                    React.createElement(
                      Icon,
                      {
                        icon: Download,
                        size: 15
                      }
                    )
                  ),

                  React.createElement(
                    "button",
                    {
                      className:
                        "icon-button danger",
                      onClick: () =>
                        deleteTemplate(
                          template.id
                        )
                    },

                    React.createElement(
                      Icon,
                      {
                        icon: Trash2,
                        size: 15
                      }
                    )
                  )
                )
              )
          )
        )
    );
  }


  /* -------------------------------------------------------
     CONTENT
     ------------------------------------------------------- */

  function renderActiveTool() {
    switch (activeTab) {
      case "wheel":
        return React.createElement(
          Wheel,
          {
            participants,
            showNotice
          }
        );

      case "duel":
        return React.createElement(
          Duel,
          {
            participants,
            showNotice
          }
        );

      case "queue":
        return React.createElement(
          Queue,
          {
            participants,
            showNotice
          }
        );

      case "groups":
      default:
        return React.createElement(
          GroupGenerator,
          {
            participants,
            showNotice,
            history,
            setHistory
          }
        );
    }
  }


  /* -------------------------------------------------------
     RENDER
     ------------------------------------------------------- */

  return React.createElement(
    React.Fragment,
    null,

    React.createElement(
      "main",
      {
        className:
          "app-shell"
      },

      React.createElement(
        "header",
        {
          className:
            "topbar"
        },

        React.createElement(
          Brand
        ),

        React.createElement(
          CloudStatus,
          {
            user,
            onLogin: () =>
              setShowAuth(true),
            onLogout: logout
          }
        )
      ),

      React.createElement(
        Hero,
        {
          participantCount:
            participants.length
        }
      ),

      React.createElement(
        TabNavigation,
        {
          activeTab,
          setActiveTab
        }
      ),

      React.createElement(
        "div",
        {
          className:
            "workspace"
        },

        React.createElement(
          "aside",
          {
            className:
              "sidebar"
          },

          React.createElement(
            ParticipantInput,
            {
              participants,
              setParticipants,
              showNotice
            }
          )
        ),

        React.createElement(
          "div",
          {
            className:
              "main-content"
          },

          renderActiveTool(),

          activeTab === "groups" &&
            React.createElement(
              HistoryPanel,
              {
                history,
                setHistory
              }
            ),

          React.createElement(
            TemplatePanel
          )
        )
      ),

      React.createElement(
        "footer",
        {
          className:
            "site-footer"
        },

        React.createElement(
          "span",
          null,
          "ArunikaMix • alat kecil untuk menyatukan orang"
        ),

        React.createElement(
          "span",
          null,
          "SUPABASE CLOUD ACTIVE"
        )
      )
    ),

    React.createElement(
      AuthModal,
      {
        show: showAuth,
        onClose: () =>
          setShowAuth(false),
        showNotice,
        onLoginSuccess: user =>
          setUser(user)
      }
    ),

    React.createElement(
      Toast,
      {
        message: notice,
        onClose: () =>
          setNotice("")
      }
    )
  );
}


/* =========================================================
   MOUNT
   ========================================================= */

const rootElement =
  document.getElementById(
    "root"
  );

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
    "Element #root tidak ditemukan."
  );
            }
