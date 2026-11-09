/* =========================================================
   ARUNIKAMIX
   Updated Main Script
   React 18 UMD + Supabase
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     BASIC SETUP
     ======================================================= */

  const React = window.React;
  const ReactDOM = window.ReactDOM;

  if (!React || !ReactDOM) {
    document.getElementById("root").innerHTML = `
      <div style="
        padding:40px;
        font-family:Arial,sans-serif;
        text-align:center;
      ">
        <h2>ArunikaMix tidak dapat dimuat.</h2>
        <p>React atau ReactDOM belum berhasil dimuat.</p>
      </div>
    `;
    return;
  }

  const {
    useState,
    useEffect,
    useMemo,
    useRef
  } = React;

  const h = React.createElement;

  /* =======================================================
     SUPABASE
     ======================================================= */

  const SUPABASE_URL =
    "https://hldsxluraxvsxscjfbqf.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodWxzZGxlcnV4c3h0c2pmYnFmIiwicmVmIjoiaHVsZGxsZXJ1eHhzeHNjamZicWYifQ";

  let supabaseClient = null;

  try {
    if (
      window.supabase &&
      typeof window.supabase.createClient === "function"
    ) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
  } catch (error) {
    console.warn("Supabase tidak tersedia:", error);
  }

  /* =======================================================
     DEFAULT ABSENCE LIST
     ======================================================= */

  const DEFAULT_NAMES = [
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
    "coral",
    "saffron",
    "teal",
    "plum",
    "sky",
    "rose",
    "mint",
    "ochre"
  ];

  /* =======================================================
     LOCAL STORAGE
     ======================================================= */

  const STORAGE_KEYS = {
    attendanceLists: "arunikamix_attendance_lists_v3",
    currentAttendance: "arunikamix_current_attendance_v3",
    history: "arunikamix_shuffle_history_v3"
  };

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("Storage read error:", error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn("Storage write error:", error);
      return false;
    }
  }

  /* =======================================================
     HELPERS
     ======================================================= */

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

  function splitIntoGroups(names, groupCount) {
    if (!names.length) return [];

    const count = Math.max(
      1,
      Math.min(
        Number(groupCount) || 1,
        names.length
      )
    );

    const shuffled = shuffleArray(names);

    const groups = Array.from(
      { length: count },
      () => []
    );

    shuffled.forEach((name, index) => {
      groups[index % count].push(name);
    });

    return groups;
  }

  function makeDuelPairs(names) {
    const shuffled = shuffleArray(names);
    const pairs = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      pairs.push({
        a: shuffled[i],
        b: shuffled[i + 1] || null
      });
    }

    return pairs;
  }

  function formatGroupsForCopy(groups) {
    return groups
      .map((group, index) => {
        return [
          `Kelompok ${index + 1}`,
          ...group.map(
            (name, personIndex) =>
              `${personIndex + 1}. ${name}`
          )
        ].join("\n");
      })
      .join("\n\n");
  }

  function cleanNames(text) {
    return text
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean);
  }

  function shortName(fullName) {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length <= 1) {
      return parts[0] || "";
    }

    /*
      Nama Indonesia seperti:

      La Ode Muhammad...
      Wa Ode Kamalia...

      dianggap mempunyai prefix 2 kata.
    */

    if (
      parts.length >= 3 &&
      (
        parts[0].toLowerCase() === "la" ||
        parts[0].toLowerCase() === "wa"
      ) &&
      parts[1].toLowerCase() === "ode"
    ) {
      return `${parts[0]} ${parts[1]} ${parts[2][0].toUpperCase()}`;
    }

    return `${parts[0]} ${parts[1][0].toUpperCase()}`;
  }

  function downloadText(filename, text) {
    const blob = new Blob(
      [text],
      { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      try {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("copy");
        textarea.remove();

        return true;
      } catch {
        return false;
      }
    }
  }

  /* =======================================================
     ICON
     Tidak bergantung pada Lucide
     ======================================================= */

  function Icon({
    name,
    size = 18,
    stroke = "currentColor"
  }) {
    const common = {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke,
      strokeWidth: 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: {
        display: "block",
        flexShrink: 0
      }
    };

    const paths = {
      plus: [
        h("path", {
          key: "p1",
          d: "M12 5v14"
        }),
        h("path", {
          key: "p2",
          d: "M5 12h14"
        })
      ],

      trash: [
        h("path", {
          key: "p1",
          d: "M3 6h18"
        }),
        h("path", {
          key: "p2",
          d: "M8 6V4h8v2"
        }),
        h("path", {
          key: "p3",
          d: "M19 6l-1 15H6L5 6"
        }),
        h("path", {
          key: "p4",
          d: "M10 11v6"
        }),
        h("path", {
          key: "p5",
          d: "M14 11v6"
        })
      ],

      edit: [
        h("path", {
          key: "p1",
          d: "M12 20h9"
        }),
        h("path", {
          key: "p2",
          d: "M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4z"
        })
      ],

      copy: [
        h("rect", {
          key: "p1",
          x: "9",
          y: "9",
          width: "11",
          height: "11",
          rx: "2"
        }),
        h("path", {
          key: "p2",
          d: "M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
        })
      ],

      shuffle: [
        h("path", {
          key: "p1",
          d: "M16 3h5v5"
        }),
        h("path", {
          key: "p2",
          d: "M4 20L21 3"
        }),
        h("path", {
          key: "p3",
          d: "M21 16v5h-5"
        }),
        h("path", {
          key: "p4",
          d: "M15 15l6 6"
        }),
        h("path", {
          key: "p5",
          d: "M4 4l5 5"
        })
      ],

      users: [
        h("path", {
          key: "p1",
          d: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        }),
        h("circle", {
          key: "p2",
          cx: "9",
          cy: "7",
          r: "4"
        }),
        h("path", {
          key: "p3",
          d: "M22 21v-2a4 4 0 00-3-3.87"
        }),
        h("path", {
          key: "p4",
          d: "M16 3.13a4 4 0 010 7.75"
        })
      ],

      save: [
        h("path", {
          key: "p1",
          d: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        }),
        h("polyline", {
          key: "p2",
          points: "17 21 17 13 7 13 7 21"
        }),
        h("polyline", {
          key: "p3",
          points: "7 3 7 8 15 8"
        })
      ],

      folder: [
        h("path", {
          key: "p1",
          d: "M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        })
      ],

      refresh: [
        h("path", {
          key: "p1",
          d: "M20 11a8.1 8.1 0 00-15.5-3"
        }),
        h("polyline", {
          key: "p2",
          points: "4 4 4 8 8 8"
        }),
        h("path", {
          key: "p3",
          d: "M4 13a8.1 8.1 0 0015.5 3"
        }),
        h("polyline", {
          key: "p4",
          points: "20 20 20 16 16 16"
        })
      ],

      play: [
        h("polygon", {
          key: "p1",
          points: "5 3 19 12 5 21 5 3"
        })
      ],

      sword: [
        h("path", {
          key: "p1",
          d: "M14.5 5.5l4-4 4 4-4 4"
        }),
        h("path", {
          key: "p2",
          d: "M18.5 9.5L8 20"
        }),
        h("path", {
          key: "p3",
          d: "M4 4l6 6"
        }),
        h("path", {
          key: "p4",
          d: "M3 8l4-4"
        })
      ],

      clock: [
        h("circle", {
          key: "p1",
          cx: "12",
          cy: "12",
          r: "9"
        }),
        h("polyline", {
          key: "p2",
          points: "12 7 12 12 15 14"
        })
      ],

      download: [
        h("path", {
          key: "p1",
          d: "M12 3v12"
        }),
        h("polyline", {
          key: "p2",
          points: "7 10 12 15 17 10"
        }),
        h("path", {
          key: "p3",
          d: "M5 21h14"
        })
      ],

      x: [
        h("path", {
          key: "p1",
          d: "M6 6l12 12"
        }),
        h("path", {
          key: "p2",
          d: "M18 6L6 18"
        })
      ],

      check: [
        h("polyline", {
          key: "p1",
          points: "20 6 9 17 4 12"
        })
      ],

      arrow: [
        h("path", {
          key: "p1",
          d: "M5 12h14"
        }),
        h("path", {
          key: "p2",
          d: "M13 6l6 6-6 6"
        })
      ]
    };

    return h(
      "svg",
      common,
      paths[name] || null
    );
  }

  /* =======================================================
     TOAST
     ======================================================= */

  function useToast() {
    const [notice, setNotice] = useState("");

    function showNotice(message) {
      setNotice(message);

      window.clearTimeout(showNotice.timer);

      showNotice.timer = window.setTimeout(() => {
        setNotice("");
      }, 2600);
    }

    return {
      notice,
      showNotice
    };
  }

  function Toast({ message }) {
    if (!message) return null;

    return h(
      "div",
      { className: "toast-notice" },
      message
    );
  }

  /* =======================================================
     ATTENDANCE MANAGER
     ======================================================= */

  function AttendanceManager({
    names,
    setNames,
    showNotice
  }) {
    const [lists, setLists] = useState(() =>
      readStorage(
        STORAGE_KEYS.attendanceLists,
        {}
      )
    );

    const [selectedList, setSelectedList] =
      useState("");

    const [showManager, setShowManager] =
      useState(false);

    const [newListName, setNewListName] =
      useState("");

    const [saveName, setSaveName] =
      useState("");

    useEffect(() => {
      writeStorage(
        STORAGE_KEYS.attendanceLists,
        lists
      );
    }, [lists]);

    function saveCurrentList() {
      const name =
        saveName.trim() ||
        "Daftar Absen";

      const updated = {
        ...lists,
        [name]: [...names]
      };

      setLists(updated);
      setSelectedList(name);
      setSaveName("");

      showNotice(
        `Daftar "${name}" berhasil disimpan.`
      );
    }

    function createNewList() {
      const name = newListName.trim();

      if (!name) {
        showNotice("Masukkan nama daftar terlebih dahulu.");
        return;
      }

      if (lists[name]) {
        showNotice("Nama daftar tersebut sudah ada.");
        return;
      }

      setLists({
        ...lists,
        [name]: []
      });

      setSelectedList(name);
      setNewListName("");
      setNames([]);

      showNotice(
        `Daftar "${name}" dibuat.`
      );
    }

    function loadList(name) {
      if (!name || !lists[name]) return;

      setSelectedList(name);
      setNames([...lists[name]]);

      showNotice(
        `Daftar "${name}" dimuat.`
      );
    }

    function deleteList(name) {
      if (!name) return;

      const ok = window.confirm(
        `Hapus daftar "${name}"?`
      );

      if (!ok) return;

      const updated = {
        ...lists
      };

      delete updated[name];

      setLists(updated);

      if (selectedList === name) {
        setSelectedList("");
      }

      showNotice(
        `Daftar "${name}" dihapus.`
      );
    }

    function renameList(name) {
      if (!name || !lists[name]) return;

      const nextName = window.prompt(
        "Nama baru daftar absen:",
        name
      );

      if (!nextName) return;

      const clean = nextName.trim();

      if (!clean) return;

      if (
        clean !== name &&
        lists[clean]
      ) {
        showNotice("Nama tersebut sudah digunakan.");
        return;
      }

      const updated = {
        ...lists
      };

      updated[clean] = updated[name];

      if (clean !== name) {
        delete updated[name];
      }

      setLists(updated);
      setSelectedList(clean);

      showNotice("Nama daftar berhasil diubah.");
    }

    return h(
      "div",
      {
        style: {
          marginBottom: "18px"
        }
      },

      h(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }
        },

        h(
          "button",
          {
            type: "button",
            className: "copy-button",
            onClick: () =>
              setShowManager(!showManager)
          },
          h(Icon, {
            name: "folder",
            size: 15
          }),
          "Daftar Absen"
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              gap: "7px",
              alignItems: "center",
              flexWrap: "wrap"
            }
          },

          h(
            "input",
            {
              value: saveName,
              onChange: (e) =>
                setSaveName(e.target.value),
              placeholder: "Nama daftar...",
              style: {
                width: "145px",
                padding: "9px 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "#fffaf1",
                fontSize: "12px"
              }
            }
          ),

          h(
            "button",
            {
              type: "button",
              className: "copy-button",
              onClick: saveCurrentList
            },
            h(Icon, {
              name: "save",
              size: 14
            }),
            "Simpan"
          )
        )
      ),

      showManager &&
        h(
          "div",
          {
            style: {
              marginTop: "12px",
              padding: "14px",
              background: "rgba(250,246,237,.9)",
              border: "1px solid var(--line)",
              borderRadius: "11px"
            }
          },

          h(
            "div",
            {
              style: {
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--coral-deep)",
                marginBottom: "9px"
              }
            },
            "DAFTAR TERSIMPAN"
          ),

          Object.keys(lists).length === 0
            ? h(
                "div",
                {
                  style: {
                    fontSize: "12px",
                    color: "var(--ink-soft)",
                    marginBottom: "12px"
                  }
                },
                "Belum ada daftar absen tersimpan."
              )
            : h(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    marginBottom: "12px"
                  }
                },

                Object.keys(lists).map(
                  (name) =>
                    h(
                      "div",
                      {
                        key: name,
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          padding: "8px 10px",
                          background: "#fffaf1",
                          border: "1px solid var(--line)",
                          borderRadius: "8px"
                        }
                      },

                      h(
                        "button",
                        {
                          type: "button",
                          style: {
                            flex: 1,
                            textAlign: "left",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--ink)",
                            fontFamily: "inherit",
                            fontWeight: 600
                          },
                          onClick: () =>
                            loadList(name)
                        },
                        name,
                        " ",
                        h(
                          "span",
                          {
                            style: {
                              color: "var(--ink-soft)",
                              fontWeight: 400,
                              fontSize: "11px"
                            }
                          },
                          `(${lists[name].length} orang)`
                        )
                      ),

                      h(
                        "button",
                        {
                          type: "button",
                          className: "icon-button",
                          title: "Rename",
                          onClick: () =>
                            renameList(name)
                        },
                        h(Icon, {
                          name: "edit",
                          size: 14
                        })
                      ),

                      h(
                        "button",
                        {
                          type: "button",
                          className: "icon-button delete-action",
                          title: "Hapus",
                          onClick: () =>
                            deleteList(name)
                        },
                        h(Icon, {
                          name: "trash",
                          size: 14
                        })
                      )
                    )
                )
              ),

          h(
            "div",
            {
              style: {
                display: "flex",
                gap: "7px"
              }
            },

            h("input", {
              value: newListName,
              onChange: (e) =>
                setNewListName(e.target.value),
              placeholder: "Nama daftar baru...",
              style: {
                flex: 1,
                padding: "9px 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "#fffaf1",
                fontSize: "12px"
              }
            }),

            h(
              "button",
              {
                type: "button",
                className: "copy-button",
                onClick: createNewList
              },
              h(Icon, {
                name: "plus",
                size: 14
              }),
              "Baru"
            )
          )
        )
    );
  }

  /* =======================================================
     PARTICIPANT PANEL
     ======================================================= */

  function ParticipantPanel({
    names,
    setNames,
    showNotice
  }) {
    const [input, setInput] = useState("");
    const [editingIndex, setEditingIndex] =
      useState(-1);
    const [editingValue, setEditingValue] =
      useState("");

    function addParticipants() {
      const incoming = cleanNames(input);

      if (!incoming.length) {
        showNotice(
          "Masukkan minimal satu nama."
        );
        return;
      }

      const updated = [
        ...names,
        ...incoming
      ];

      setNames(updated);
      setInput("");

      showNotice(
        `${incoming.length} peserta ditambahkan.`
      );
    }

    function deleteParticipant(index) {
      setNames(
        names.filter(
          (_, i) => i !== index
        )
      );
    }

    function startEdit(index) {
      setEditingIndex(index);
      setEditingValue(names[index]);
    }

    function saveEdit(index) {
      const value = editingValue.trim();

      if (!value) {
        showNotice("Nama tidak boleh kosong.");
        return;
      }

      const updated = [...names];
      updated[index] = value;

      setNames(updated);
      setEditingIndex(-1);
      setEditingValue("");
    }

    function clearAll() {
      if (!names.length) return;

      const ok = window.confirm(
        "Hapus semua peserta?"
      );

      if (!ok) return;

      setNames([]);

      showNotice("Semua peserta dihapus.");
    }

    function resetDefault() {
      setNames([...DEFAULT_NAMES]);

      showNotice(
        "Daftar awal berhasil dikembalikan."
      );
    }

    return h(
      "section",
      { className: "panel" },

      h(
        "div",
        { className: "panel-heading" },

        h(
          "div",
          null,

          h(
            "div",
            { className: "section-kicker" },
            h(Icon, {
              name: "users",
              size: 13
            }),
            "ABSEN"
          ),

          h(
            "h2",
            null,
            "Daftar Peserta"
          )
        ),

        h(
          "div",
          {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--ink-soft)"
            }
          },
          `${names.length} orang`
        )
      ),

      h(
        "p",
        { className: "panel-intro" },
        "Kelola nama peserta sebelum mulai mengacak."
      ),

      h(AttendanceManager, {
        names,
        setNames,
        showNotice
      }),

      h(
        "textarea",
        {
          value: input,
          onChange: (e) =>
            setInput(e.target.value),
          placeholder:
            "Tambahkan nama...\nSatu nama setiap baris.",
          rows: 4,
          style: {
            width: "100%",
            padding: "11px",
            border: "1px solid var(--line)",
            borderRadius: "9px",
            resize: "vertical",
            marginBottom: "8px"
          }
        }
      ),

      h(
        "div",
        {
          style: {
            display: "flex",
            gap: "7px",
            marginBottom: "15px",
            flexWrap: "wrap"
          }
        },

        h(
          "button",
          {
            type: "button",
            className: "copy-button",
            onClick: addParticipants
          },
          h(Icon, {
            name: "plus",
            size: 14
          }),
          "Tambah"
        ),

        h(
          "button",
          {
            type: "button",
            className: "copy-button",
            onClick: clearAll
          },
          h(Icon, {
            name: "trash",
            size: 14
          }),
          "Hapus Semua"
        ),

        h(
          "button",
          {
            type: "button",
            className: "copy-button",
            onClick: resetDefault
          },
          h(Icon, {
            name: "refresh",
            size: 14
          }),
          "Reset"
        )
      ),

      h(
        "div",
        { className: "participant-list" },

        names.map((name, index) =>
          h(
            "div",
            {
              className: "participant-row",
              key: `${name}-${index}`
            },

            h(
              "span",
              { className: "person-number" },
              String(index + 1).padStart(2, "0")
            ),

            editingIndex === index
              ? h(
                  React.Fragment,
                  null,

                  h("input", {
                    className: "edit-input",
                    value: editingValue,
                    autoFocus: true,
                    onChange: (e) =>
                      setEditingValue(
                        e.target.value
                      ),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        saveEdit(index);
                      }

                      if (e.key === "Escape") {
                        setEditingIndex(-1);
                      }
                    }
                  }),

                  h(
                    "button",
                    {
                      type: "button",
                      className: "row-action",
                      onClick: () =>
                        saveEdit(index)
                    },
                    h(Icon, {
                      name: "check",
                      size: 15
                    })
                  )
                )
              : h(
                  React.Fragment,
                  null,

                  h(
                    "span",
                    { className: "person-name" },
                    name
                  ),

                  h(
                    "div",
                    { className: "row-actions" },

                    h(
                      "button",
                      {
                        type: "button",
                        className: "row-action",
                        title: "Edit",
                        onClick: () =>
                          startEdit(index)
                      },
                      h(Icon, {
                        name: "edit",
                        size: 15
                      })
                    ),

                    h(
                      "button",
                      {
                        type: "button",
                        className:
                          "row-action delete-action",
                        title: "Hapus",
                        onClick: () =>
                          deleteParticipant(index)
                      },
                      h(Icon, {
                        name: "trash",
                        size: 15
                      })
                    )
                  )
                )
          )
        )
      )
    );
  }

  /* =======================================================
     MIX PANEL
     ======================================================= */

  function MixPanel({
    names,
    groupCount,
    setGroupCount,
    onMix
  }) {
    const maxGroups = Math.max(
      1,
      names.length
    );

    useEffect(() => {
      if (!names.length) {
        setGroupCount(1);
        return;
      }

      if (groupCount > names.length) {
        setGroupCount(names.length);
      }

      if (groupCount < 1) {
        setGroupCount(1);
      }
    }, [
      names.length,
      groupCount
    ]);

    function changeGroupCount(value) {
      const number = Number(value);

      if (!names.length) {
        setGroupCount(1);
        return;
      }

      setGroupCount(
        Math.max(
          1,
          Math.min(
            number || 1,
            names.length
          )
        )
      );
    }

    return h(
      "section",
      { className: "mix-panel" },

      h(
        "div",
        { className: "mix-topline" },

        h(
          "div",
          null,

          h(
            "div",
            { className: "section-kicker" },
            h(Icon, {
              name: "shuffle",
              size: 13
            }),
            "PEMBAGI"
          ),

          h(
            "h2",
            null,
            "Acak Kelompok"
          )
        )
      ),

      h(
        "p",
        { className: "mix-description" },
        "Tentukan jumlah kelompok. Tidak lagi mentok di 8 — jumlah maksimal mengikuti jumlah anggota."
      ),

      h(
        "div",
        { className: "balance-note" },

        h(
          "span",
          { className: "balance-mark" },
          "●"
        ),

        h(
          "span",
          null,
          names.length
            ? `${names.length} anggota`
            : "Belum ada anggota"
        ),

        h("span", {
          className: "balance-divider"
        }),

        h(
          "span",
          null,
          `maks. ${maxGroups} kelompok`
        )
      ),

      h(
        "div",
        {
          style: {
            marginBottom: "18px"
          }
        },

        h(
          "label",
          {
            style: {
              display: "block",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--ink-soft)",
              marginBottom: "7px"
            }
          },
          "JUMLAH KELOMPOK"
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "9px"
            }
          },

          h("input", {
            type: "number",
            min: 1,
            max: maxGroups,
            value: groupCount,
            disabled: !names.length,
            onChange: (e) =>
              changeGroupCount(
                e.target.value
              ),
            style: {
              width: "95px",
              padding: "11px",
              border: "1px solid var(--line)",
              borderRadius: "9px",
              background: "#fffaf1",
              color: "var(--ink)",
              fontSize: "18px",
              fontFamily: "var(--font-mono)",
              fontWeight: 700
            }
          }),

          h(
            "input",
            {
              type: "range",
              min: 1,
              max: maxGroups,
              value: Math.min(
                groupCount,
                maxGroups
              ),
              disabled: !names.length,
              onChange: (e) =>
                changeGroupCount(
                  e.target.value
                ),
              style: {
                flex: 1,
                accentColor: "var(--plum)"
              }
            }
          )
        ),

        h(
          "div",
          {
            style: {
              marginTop: "7px",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              color: "var(--ink-soft)"
            }
          },
          h("span", null, "1 kelompok"),
          h(
            "span",
            null,
            `${maxGroups} kelompok`
          )
        )
      ),

      h(
        "button",
        {
          type: "button",
          className: "shuffle-button",
          disabled:
            names.length === 0,
          onClick: onMix
        },
        h(Icon, {
          name: "shuffle",
          size: 17
        }),
        `Bagi Menjadi ${groupCount} Kelompok`
      ),

      h(
        "div",
        {
          style: {
            marginTop: "12px",
            fontSize: "11px",
            color: "var(--ink-soft)",
            lineHeight: 1.5
          }
        },
        names.length
          ? `Contoh: ${names.length} orang bisa dibagi menjadi 1–${names.length} kelompok.`
          : "Tambahkan peserta terlebih dahulu."
      )
    );
  }

  /* =======================================================
     RESULTS
     ======================================================= */

  function Results({
    groups,
    onCopy
  }) {
    if (!groups.length) {
      return h(
        "section",
        { className: "results-section" },

        h(
          "div",
          { className: "results-heading" },

          h(
            "div",
            null,

            h(
              "div",
              { className: "section-kicker" },
              "HASIL"
            ),

            h(
              "h2",
              null,
              "Kelompok Belum Dibuat"
            )
          )
        ),

        h(
          "div",
          { className: "result-empty" },

          h(
            "div",
            { className: "empty-sun" },
            "✦"
          ),

          h(
            "div",
            null,
            "Atur jumlah kelompok lalu tekan tombol acak."
          )
        )
      );
    }

    return h(
      "section",
      { className: "results-section" },

      h(
        "div",
        { className: "results-heading" },

        h(
          "div",
          null,

          h(
            "div",
            { className: "section-kicker" },
            "HASIL PEMBAGIAN"
          ),

          h(
            "h2",
            null,
            `${groups.length} Kelompok`
          )
        ),

        h(
          "button",
          {
            type: "button",
            className: "copy-button",
            onClick: onCopy
          },
          h(Icon, {
            name: "copy",
            size: 14
          }),
          "Salin"
        )
      ),

      h(
        "div",
        { className: "groups-grid" },

        groups.map(
          (group, index) =>
            h(
              "div",
              {
                key: index,
                className:
                  `group-card group-${GROUP_COLORS[
                    index % GROUP_COLORS.length
                  ]}`
              },

              h(
                "div",
                {
                  className:
                    "group-card-head"
                },

                h(
                  "span",
                  { className: "group-number" },
                  `Kelompok ${index + 1}`
                ),

                h(
                  "span",
                  null,
                  `${group.length} orang`
                )
              ),

              h(
                "div",
                {
                  className: "group-names"
                },

                group.map(
                  (name, personIndex) =>
                    h(
                      "div",
                      {
                        key: `${name}-${personIndex}`,
                        className:
                          "group-person"
                      },

                      h("span", {
                        className:
                          "member-dot"
                      }),

                      name
                    )
                )
              )
            )
        )
      )
    );
  }

  /* =======================================================
     SPIN WHEEL
     ======================================================= */

  function SpinWheel({
    names,
    showNotice
  }) {
    const [open, setOpen] =
      useState(false);

    const [rotation, setRotation] =
      useState(0);

    const [spinning, setSpinning] =
      useState(false);

    const [winner, setWinner] =
      useState(null);

    const wheelRef = useRef(null);

    const segments = useMemo(() => {
      return names.map((name, index) => ({
        name,
        short: shortName(name),
        index
      }));
    }, [names]);

    const segmentCount =
      Math.max(1, segments.length);

    const angle =
      360 / segmentCount;

    /*
      Warna wheel dibuat menggunakan
      conic-gradient.
    */

    const wheelBackground =
      useMemo(() => {
        if (!segments.length) {
          return "#e5daca";
        }

        const colors = [
          "#e87868",
          "#e8b34d",
          "#76a99a",
          "#4b304d",
          "#86abb4",
          "#d78b88",
          "#93b99d",
          "#ba8850"
        ];

        const stops = segments.map(
          (_, index) => {
            const start =
              index * angle;

            const end =
              (index + 1) * angle;

            const color =
              colors[
                index % colors.length
              ];

            return `${color} ${start}deg ${end}deg`;
          }
        );

        return `conic-gradient(from -90deg, ${stops.join(", ")})`;
      }, [
        segments,
        angle
      ]);

    function openWheel() {
      if (!names.length) {
        showNotice(
          "Tambahkan peserta terlebih dahulu."
        );
        return;
      }

      setWinner(null);
      setOpen(true);
    }

    function spin() {
      if (
        spinning ||
        !segments.length
      ) {
        return;
      }

      setSpinning(true);
      setWinner(null);

      const winnerIndex =
        Math.floor(
          Math.random() *
            segments.length
        );

      /*
        Pointer berada di atas.
        Wheel menggunakan:
        from -90deg.

        Target dihitung supaya
        bagian tengah segment pemenang
        berhenti tepat di pointer.
      */

      const segmentCenter =
        winnerIndex * angle +
        angle / 2;

      const targetOffset =
        360 -
        segmentCenter;

      const extraTurns =
        360 *
        (5 + Math.floor(Math.random() * 3));

      const currentNormalized =
        ((rotation % 360) + 360) % 360;

      const target =
        rotation -
        currentNormalized +
        extraTurns +
        targetOffset;

      setRotation(target);

      window.setTimeout(() => {
        setWinner(
          segments[winnerIndex].name
        );

        setSpinning(false);

        showNotice(
          `Terpilih: ${segments[winnerIndex].name}`
        );
      }, 4200);
    }

    return h(
      React.Fragment,
      null,

      h(
        "button",
        {
          type: "button",
          className: "copy-button",
          onClick: openWheel
        },
        h(Icon, {
          name: "play",
          size: 14
        }),
        "Roda Putar"
      ),

      open &&
        h(
          "div",
          {
            style: {
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              background: "rgba(48,35,51,.48)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            },
            onMouseDown: (e) => {
              if (
                e.target === e.currentTarget &&
                !spinning
              ) {
                setOpen(false);
              }
            }
          },

          h(
            "div",
            {
              style: {
                width: "min(570px, 100%)",
                maxHeight: "92vh",
                overflowY: "auto",
                background: "#fffaf1",
                border: "1px solid var(--line)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow:
                  "0 25px 70px rgba(0,0,0,.22)"
              }
            },

            h(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px"
                }
              },

              h(
                "div",
                null,

                h(
                  "div",
                  {
                    className:
                      "section-kicker"
                  },
                  "SPIN WHEEL"
                ),

                h(
                  "h2",
                  {
                    style: {
                      fontFamily:
                        "var(--font-display)",
                      margin: 0,
                      fontSize: "27px"
                    }
                  },
                  "Siapa yang terpilih?"
                )
              ),

              h(
                "button",
                {
                  type: "button",
                  className: "icon-button",
                  disabled: spinning,
                  onClick: () =>
                    setOpen(false)
                },
                h(Icon, {
                  name: "x",
                  size: 18
                })
              )
            ),

            h(
              "div",
              {
                style: {
                  textAlign: "center",
                  fontSize: "11px",
                  fontFamily:
                    "var(--font-mono)",
                  color: "var(--ink-soft)",
                  marginBottom: "14px"
                }
              },
              `${names.length} peserta`
            ),

            h(
              "div",
              {
                style: {
                  position: "relative",
                  width: "min(420px, 82vw)",
                  aspectRatio: "1",
                  margin: "0 auto 24px"
                }
              },

              /*
                POINTER
              */

              h(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: "-4px",
                    left: "50%",
                    transform:
                      "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft:
                      "12px solid transparent",
                    borderRight:
                      "12px solid transparent",
                    borderTop:
                      "25px solid var(--plum)",
                    zIndex: 5,
                    filter:
                      "drop-shadow(0 3px 3px rgba(0,0,0,.2))"
                  }
                }
              ),

              h(
                "div",
                {
                  ref: wheelRef,
                  style: {
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background:
                      wheelBackground,
                    border:
                      "7px solid #fffaf1",
                    boxShadow:
                      "0 8px 30px rgba(48,35,51,.16)",
                    transform:
                      `rotate(${rotation}deg)`,
                    transition: spinning
                      ? "transform 4.2s cubic-bezier(.12,.72,.12,1)"
                      : "none",
                    overflow: "hidden"
                  }
                },

                /*
                  LABELS WHEEL
                */

                segments.map(
                  (segment, index) => {
                    const center =
                      index * angle +
                      angle / 2;

                    const fontSize =
                      segments.length <= 8
                        ? 14
                        : segments.length <= 14
                        ? 11
                        : segments.length <= 20
                        ? 9
                        : 7;

                    return h(
                      "div",
                      {
                        key: `${segment.name}-${index}`,
                        style: {
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: "48%",
                          transform:
                            `rotate(${center}deg) translateY(-50%)`,
                          transformOrigin:
                            "0 50%",
                          color: "#fff",
                          fontFamily:
                            "var(--font-sans)",
                          fontSize:
                            `${fontSize}px`,
                          fontWeight: 700,
                          textAlign: "right",
                          paddingRight: "8px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          textShadow:
                            "0 1px 2px rgba(0,0,0,.25)",
                          pointerEvents:
                            "none"
                        }
                      },
                      segment.short
                    );
                  }
                ),

                /*
                  CENTER
                */

                h(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform:
                        "translate(-50%,-50%)",
                      width: "58px",
                      height: "58px",
                      borderRadius: "50%",
                      background:
                        "#fffaf1",
                      border:
                        "3px solid var(--plum)",
                      display: "grid",
                      placeItems: "center",
                      zIndex: 3,
                      fontFamily:
                        "var(--font-mono)",
                      fontSize: "10px",
                      color:
                        "var(--plum)",
                      fontWeight: 700
                    }
                  },
                  "SPIN"
                )
              )
            ),

            winner &&
              h(
                "div",
                {
                  style: {
                    textAlign: "center",
                    marginBottom: "18px",
                    padding: "14px",
                    background:
                      "rgba(232,179,77,.15)",
                    border:
                      "1px solid var(--line)",
                    borderRadius: "12px"
                  }
                },

                h(
                  "div",
                  {
                    style: {
                      fontSize: "10px",
                      fontFamily:
                        "var(--font-mono)",
                      color:
                        "var(--ink-soft)",
                      marginBottom: "4px",
                      textTransform:
                        "uppercase"
                    }
                  },
                  "Yang terpilih"
                ),

                h(
                  "div",
                  {
                    style: {
                      fontFamily:
                        "var(--font-display)",
                      fontSize: "28px",
                      color:
                        "var(--plum)"
                    }
                  },
                  winner
                )
              ),

            h(
              "button",
              {
                type: "button",
                className: "shuffle-button",
                disabled: spinning,
                onClick: spin
              },
              h(Icon, {
                name: "play",
                size: 17
              }),
              spinning
                ? "Roda sedang berputar..."
                : "PUTAR RODA"
            ),

            h(
              "div",
              {
                style: {
                  marginTop: "10px",
                  textAlign: "center",
                  fontSize: "10px",
                  color:
                    "var(--ink-soft)",
                  fontFamily:
                    "var(--font-mono)"
                }
              },
              "Nama di roda menggunakan nama depan + inisial nama kedua."
            )
          )
        )
    );
  }

  /* =======================================================
     DUEL
     ======================================================= */

  function DuelTool({
    names,
    showNotice
  }) {
    const [pairs, setPairs] =
      useState([]);

    function makeDuel() {
      if (names.length < 2) {
        showNotice(
          "Minimal 2 peserta untuk duel."
        );
        return;
      }

      setPairs(
        makeDuelPairs(names)
      );
    }

    return h(
      "section",
      {
        style: {
          background:
            "rgba(255,250,241,.82)",
          border:
            "1px solid var(--line)",
          borderRadius: "18px",
          padding: "28px",
          marginBottom: "25px"
        }
      },

      h(
        "div",
        {
          className:
            "results-heading"
        },

        h(
          "div",
          null,

          h(
            "div",
            {
              className:
                "section-kicker"
            },
            "DUEL"
          ),

          h(
            "h2",
            null,
            "Undian Berpasangan"
          )
        ),

        h(
          "button",
          {
            type: "button",
            className:
              "copy-button",
            onClick: makeDuel
          },
          h(Icon, {
            name: "shuffle",
            size: 14
          }),
          "Acak Duel"
        )
      ),

      pairs.length === 0
        ? h(
            "div",
            {
              className:
                "result-empty"
            },
            "Tekan Acak Duel untuk membuat pasangan."
          )
        : h(
            "div",
            {
              className:
                "groups-grid"
            },

            pairs.map(
              (pair, index) =>
                h(
                  "div",
                  {
                    key: index,
                    className:
                      "group-card"
                  },

                  h(
                    "div",
                    {
                      className:
                        "group-card-head"
                    },
                    `Duel ${index + 1}`
                  ),

                  h(
                    "div",
                    {
                      style: {
                        padding: "15px",
                        textAlign: "center",
                        fontSize: "14px",
                        lineHeight: 1.8
                      }
                    },

                    h(
                      "strong",
                      null,
                      pair.a
                    ),

                    pair.b
                      ? h(
                          "div",
                          {
                            style: {
                              color:
                                "var(--coral-deep)",
                              fontFamily:
                                "var(--font-mono)",
                              fontSize: "11px"
                            }
                          },
                          "VS"
                        )
                      : h(
                          "div",
                          {
                            style: {
                              marginTop: "5px",
                              color:
                                "var(--ink-soft)",
                              fontSize: "11px"
                            }
                          },
                          "BYE"
                        ),

                    pair.b &&
                      h(
                        "strong",
                        null,
                        pair.b
                      )
                  )
                )
            )
          )
    );
  }

  /* =======================================================
     QUEUE
     ======================================================= */

  function QueueTool({
    names,
    showNotice
  }) {
    const [queue, setQueue] =
      useState([]);

    function makeQueue() {
      if (!names.length) {
        showNotice(
          "Belum ada peserta."
        );
        return;
      }

      setQueue(
        shuffleArray(names)
      );
    }

    function copyQueue() {
      if (!queue.length) return;

      copyText(
        queue
          .map(
            (name, index) =>
              `${index + 1}. ${name}`
          )
          .join("\n")
      ).then(() => {
        showNotice(
          "Urutan antrean disalin."
        );
      });
    }

    return h(
      "section",
      {
        style: {
          background:
            "rgba(255,250,241,.82)",
          border:
            "1px solid var(--line)",
          borderRadius: "18px",
          padding: "28px",
          marginBottom: "25px"
        }
      },

      h(
        "div",
        {
          className:
            "results-heading"
        },

        h(
          "div",
          null,

          h(
            "div",
            {
              className:
                "section-kicker"
            },
            "ANTREAN"
          ),

          h(
            "h2",
            null,
            "Urutan Giliran"
          )
        ),

        h(
          "div",
          {
            style: {
              display: "flex",
              gap: "7px"
            }
          },

          h(
            "button",
            {
              type: "button",
              className:
                "copy-button",
              onClick: makeQueue
            },
            h(Icon, {
              name: "shuffle",
              size: 14
            }),
            "Acak"
          ),

          queue.length > 0 &&
            h(
              "button",
              {
                type: "button",
                className:
                  "copy-button",
                onClick: copyQueue
              },
              h(Icon, {
                name: "copy",
                size: 14
              }),
              "Salin"
            )
        )
      ),

      queue.length === 0
        ? h(
            "div",
            {
              className:
                "result-empty"
            },
            "Buat urutan antrean secara acak."
          )
        : h(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(220px,1fr))",
                gap: "7px"
              }
            },

            queue.map(
              (name, index) =>
                h(
                  "div",
                  {
                    key: `${name}-${index}`,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      border:
                        "1px solid var(--line)",
                      borderRadius: "8px",
                      background:
                        "rgba(250,246,237,.9)"
                    }
                  },

                  h(
                    "span",
                    {
                      style: {
                        fontFamily:
                          "var(--font-mono)",
                        color:
                          "var(--coral-deep)",
                        fontSize: "11px",
                        minWidth: "22px"
                      }
                    },
                    String(index + 1)
                  ),

                  h(
                    "span",
                    {
                      style: {
                        fontSize: "13px"
                      }
                    },
                    name
                  )
                )
            )
          )
    );
  }

  /* =======================================================
     HISTORY
     ======================================================= */

  function HistoryPanel({
    history,
    setHistory,
    showNotice
  }) {
    if (!history.length) {
      return null;
    }

    function clearHistory() {
      setHistory([]);
      writeStorage(
        STORAGE_KEYS.history,
        []
      );

      showNotice(
        "Riwayat dihapus."
      );
    }

    return h(
      "section",
      {
        style: {
          background:
            "rgba(255,250,241,.82)",
          border:
            "1px solid var(--line)",
          borderRadius: "18px",
          padding: "28px",
          marginBottom: "25px"
        }
      },

      h(
        "div",
        {
          className:
            "results-heading"
        },

        h(
          "div",
          null,

          h(
            "div",
            {
              className:
                "section-kicker"
            },
            "RIWAYAT"
          ),

          h(
            "h2",
            null,
            "Acakan Sebelumnya"
          )
        ),

        h(
          "button",
          {
            type: "button",
            className:
              "copy-button",
            onClick: clearHistory
          },
          h(Icon, {
            name: "trash",
            size: 14
          }),
          "Hapus Riwayat"
        )
      ),

      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }
        },

        history.map(
          (item, index) =>
            h(
              "div",
              {
                key: `${item.time}-${index}`,
                style: {
                  border:
                    "1px solid var(--line)",
                  borderRadius: "9px",
                  padding: "10px 12px",
                  background:
                    "rgba(250,246,237,.8)"
                }
              },

              h(
                "div",
                {
                  style: {
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "10px",
                    fontFamily:
                      "var(--font-mono)",
                    fontSize: "10px",
                    color:
                      "var(--ink-soft)"
                  }
                },

                h(
                  "span",
                  null,
                  item.time
                ),

                h(
                  "span",
                  null,
                  `${item.groups} kelompok`
                )
              )
            )
        )
      )
    );
  }

  /* =======================================================
     EXTRA TOOLS
     ======================================================= */

  function ExtraTools({
    names,
    showNotice
  }) {
    const [open, setOpen] =
      useState(false);

    return h(
      "section",
      {
        style: {
          marginBottom: "25px"
        }
      },

      h(
        "button",
        {
          type: "button",
          className:
            "copy-button",
          onClick: () =>
            setOpen(!open)
        },
        h(Icon, {
          name: "arrow",
          size: 14
        }),
        open
          ? "Tutup alat tambahan"
          : "Buka alat tambahan"
      ),

      open &&
        h(
          "div",
          {
            style: {
              marginTop: "12px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap"
            }
          },

          h(SpinWheel, {
            names,
            showNotice
          })
        )
    );
  }

  /* =======================================================
     APP
     ======================================================= */

  function App() {
    const [names, setNames] =
      useState(() =>
        readStorage(
          STORAGE_KEYS.currentAttendance,
          DEFAULT_NAMES
        )
      );

    const [groupCount, setGroupCount] =
      useState(() => {
        const stored =
          readStorage(
            "arunikamix_group_count_v3",
            4
          );

        return Math.max(
          1,
          Number(stored) || 4
        );
      });

    const [groups, setGroups] =
      useState([]);

    const [history, setHistory] =
      useState(() =>
        readStorage(
          STORAGE_KEYS.history,
          []
        )
      );

    const {
      notice,
      showNotice
    } = useToast();

    useEffect(() => {
      writeStorage(
        STORAGE_KEYS.currentAttendance,
        names
      );
    }, [names]);

    useEffect(() => {
      writeStorage(
        "arunikamix_group_count_v3",
        groupCount
      );
    }, [groupCount]);

    function mixGroups() {
      if (!names.length) {
        showNotice(
          "Tambahkan peserta terlebih dahulu."
        );
        return;
      }

      const safeGroupCount =
        Math.max(
          1,
          Math.min(
            groupCount,
            names.length
          )
        );

      const result =
        splitIntoGroups(
          names,
          safeGroupCount
        );

      setGroups(result);

      const historyItem = {
        time:
          new Date().toLocaleString(
            "id-ID",
            {
              dateStyle: "short",
              timeStyle: "short"
            }
          ),
        groups:
          safeGroupCount
      };

      const nextHistory = [
        historyItem,
        ...history
      ].slice(0, 10);

      setHistory(nextHistory);

      writeStorage(
        STORAGE_KEYS.history,
        nextHistory
      );

      window.setTimeout(() => {
        document
          .querySelector(
            ".results-section"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
      }, 50);

      showNotice(
        `${safeGroupCount} kelompok berhasil dibuat.`
      );
    }

    function copyGroups() {
      if (!groups.length) return;

      copyText(
        formatGroupsForCopy(groups)
      ).then((success) => {
        showNotice(
          success
            ? "Hasil kelompok disalin."
            : "Gagal menyalin hasil."
        );
      });
    }

    return h(
      "div",
      {
        className:
          "app-shell"
      },

      /*
        Background
      */

      h("div", {
        className:
          "ambient-orb ambient-orb-one"
      }),

      h("div", {
        className:
          "ambient-orb ambient-orb-two"
      }),

      /*
        HEADER
      */

      h(
        "header",
        {
          className:
            "site-header"
        },

        h(
          "div",
          {
            className:
              "brand-lockup"
          },

          h(
            "div",
            {
              className:
                "brand-mark"
            },

            h("span"),
            h("span"),
            h("span")
          ),

          h(
            "span",
            null,
            "ArunikaMix"
          )
        ),

        h(
          "div",
          {
            className:
              "header-note"
          },

          h("span", {
            className:
              "pulse-dot"
          }),

          "LOCAL MODE"
        )
      ),

      /*
        HERO
      */

      h(
        "section",
        {
          className:
            "hero-wrap"
        },

        h(
          "div",
          {
            className:
              "hero-copy"
          },

          h(
            "div",
            {
              className:
                "eyebrow"
            },
            "PEMBAGI KELOMPOK ACAK & MINI GAMES"
          ),

          h(
            "h1",
            null,
            "Beri ruang ",
            h(
              "em",
              null,
              "untuk kejutan."
            )
          ),

          h(
            "p",
            null,
            "Atur daftar absen, bagi kelompok secara adil, lalu biarkan sedikit kejutan menentukan siapa dengan siapa."
          )
        ),

        h(
          "div",
          {
            className:
              "hero-stamp"
          },

          h(
            "div",
            {
              className:
                "stamp-number"
            },
            names.length
          ),

          h(
            "div",
            {
              className:
                "stamp-caption"
            },
            "orang",
            h("br"),
            "di dalamnya"
          ),

          h("div", {
            className:
              "stamp-line"
          }),

          h(
            "div",
            {
              className:
                "stamp-caption"
            },
            "satu titik awal yang adil"
          )
        )
      ),

      /*
        MAIN WORKSPACE
      */

      h(
        "main",
        null,

        h(
          "div",
          {
            className:
              "workspace"
          },

          h(
            ParticipantPanel,
            {
              names,
              setNames,
              showNotice
            }
          ),

          h(
            MixPanel,
            {
              names,
              groupCount,
              setGroupCount,
              onMix: mixGroups
            }
          )
        ),

        h(
          Results,
          {
            groups,
            onCopy: copyGroups
          }
        ),

        /*
          TOOLS DI BAWAH PEMBAGI KELOMPOK
          sehingga Spin/Duel tidak menjadi bagian
          dari pengaturan jumlah kelompok.
        */

        h(
          ExtraTools,
          {
            names,
            showNotice
          }
        ),

        h(
          DuelTool,
          {
            names,
            showNotice
          }
        ),

        h(
          QueueTool,
          {
            names,
            showNotice
          }
        ),

        h(
          HistoryPanel,
          {
            history,
            setHistory,
            showNotice
          }
        )
      ),

      /*
        FOOTER
      */

      h(
        "footer",
        {
          className:
            "site-footer"
        },

        h(
          "span",
          null,
          "ArunikaMix • alat kecil untuk menyatukan orang"
        ),

        h(
          "span",
          {
            style: {
              fontFamily:
                "var(--font-mono)"
            }
          },
          "LOCAL ABSEN / TANPA LOGIN"
        )
      ),

      h(
        Toast,
        {
          message: notice
        }
      )
    );
  }

  /* =======================================================
     ERROR HANDLING
     ======================================================= */

  window.addEventListener(
    "error",
    function (event) {
      console.error(
        "ArunikaMix error:",
        event.error || event.message
      );
    }
  );

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      console.error(
        "ArunikaMix promise error:",
        event.reason
      );
    }
  );

  /* =======================================================
     RENDER
     ======================================================= */

  try {
    const rootElement =
      document.getElementById("root");

    if (!rootElement) {
      throw new Error(
        'Element "#root" tidak ditemukan.'
      );
    }

    const root =
      ReactDOM.createRoot(
        rootElement
      );

    root.render(
      h(App)
    );
  } catch (error) {
    console.error(
      "Gagal menjalankan ArunikaMix:",
      error
    );

    const rootElement =
      document.getElementById("root");

    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          max-width:700px;
          margin:80px auto;
          padding:30px;
          background:#fffaf1;
          border:1px solid #e5daca;
          border-radius:16px;
          color:#302333;
          font-family:Arial,sans-serif;
        ">
          <h2 style="margin-top:0;">
            ArunikaMix mengalami error.
          </h2>

          <p>
            Aplikasi gagal menjalankan JavaScript.
          </p>

          <pre style="
            white-space:pre-wrap;
            background:#f7f0e1;
            padding:14px;
            border-radius:8px;
            overflow:auto;
            font-size:12px;
          ">${String(error.message || error)}</pre>
        </div>
      `;
    }
  }
})();
