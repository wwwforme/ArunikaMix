/* =========================================================
   ARUNIKAMIX
   Main Script
   React 18 UMD + Supabase
========================================================= */

(function () {
  "use strict";

  /* =======================================================
     SAFETY CHECK
  ======================================================= */

  if (!window.React || !window.ReactDOM) {
    document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:grid;
        place-items:center;
        padding:30px;
        font-family:Arial,sans-serif;
        background:#f7f0e1;
        color:#302333;
        text-align:center;
      ">
        <div>
          <h2>ArunikaMix gagal dimuat</h2>
          <p>React atau ReactDOM tidak berhasil dimuat.</p>
        </div>
      </div>
    `;
    return;
  }

  const React = window.React;
  const ReactDOM = window.ReactDOM;

  const {
    useState,
    useEffect,
    useMemo
  } = React;

  const h = React.createElement;

  /* =======================================================
     SUPABASE
  ======================================================= */

  const SUPABASE_URL =
    "https://hldsxluraxvsxscjfbqf.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodWxzZGxlcnV4c3h0c2pmYnFmIiwicmVmIjoiYW5vbiIsImlhdCI6MTY5NTY0NTgzOCwiZXhwIjoxNjk1NjQ1ODM4fQ";

  let supabaseClient = null;

  try {
    if (window.supabase && window.supabase.createClient) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
  } catch (error) {
    console.warn("Supabase tidak tersedia:", error);
  }

  /* =======================================================
     DATA
  ======================================================= */

  const ORIGINAL_PEOPLE = [
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

  const GROUP_LABELS = [
    "Coral",
    "Saffron",
    "Teal",
    "Plum",
    "Sky",
    "Rose",
    "Mint",
    "Ochre"
  ];

  /* =======================================================
     ICON HELPER
     Tidak bergantung pada Lucide agar halaman tidak blank.
  ======================================================= */

  function Icon({ name, size = 17, stroke = 1.8 }) {
    const paths = {
      plus: [
        h("path", { d: "M12 5v14" }),
        h("path", { d: "M5 12h14" })
      ],

      trash: [
        h("path", { d: "M3 6h18" }),
        h("path", { d: "M8 6V4h8v2" }),
        h("path", { d: "M19 6l-1 14H6L5 6" }),
        h("path", { d: "M10 11v5" }),
        h("path", { d: "M14 11v5" })
      ],

      edit: [
        h("path", {
          d: "M12 20h9"
        }),
        h("path", {
          d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
        })
      ],

      check: [
        h("path", {
          d: "m5 12 4 4L19 6"
        })
      ],

      shuffle: [
        h("path", {
          d: "M16 3h5v5"
        }),
        h("path", {
          d: "M4 20 21 3"
        }),
        h("path", {
          d: "M21 16v5h-5"
        }),
        h("path", {
          d: "m15 15 6 6"
        }),
        h("path", {
          d: "M4 4l5 5"
        })
      ],

      copy: [
        h("rect", {
          x: 9,
          y: 9,
          width: 11,
          height: 11,
          rx: 2
        }),
        h("path", {
          d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        })
      ],

      rotate: [
        h("path", {
          d: "M3 12a9 9 0 0 1 15.3-6.4L21 8"
        }),
        h("path", {
          d: "M21 3v5h-5"
        }),
        h("path", {
          d: "M21 12a9 9 0 0 1-15.3 6.4L3 16"
        }),
        h("path", {
          d: "M3 21v-5h5"
        })
      ],

      users: [
        h("path", {
          d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        }),
        h("circle", {
          cx: 9,
          cy: 7,
          r: 4
        }),
        h("path", {
          d: "M22 21v-2a4 4 0 0 0-3-3.87"
        }),
        h("path", {
          d: "M16 3.13a4 4 0 0 1 0 7.75"
        })
      ],

      save: [
        h("path", {
          d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"
        }),
        h("polyline", {
          points: "17 21 17 13 7 13 7 21"
        }),
        h("polyline", {
          points: "7 3 7 8 15 8"
        })
      ],

      cloud: [
        h("path", {
          d: "M17.5 19H9a7 7 0 1 1 6.7-9"
        }),
        h("path", {
          d: "M12 13h8"
        }),
        h("path", {
          d: "m17 8 3 5-3 5"
        })
      ],

      logIn: [
        h("path", {
          d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
        }),
        h("polyline", {
          points: "10 17 15 12 10 7"
        }),
        h("line", {
          x1: 15,
          y1: 12,
          x2: 3,
          y2: 12
        })
      ],

      logOut: [
        h("path", {
          d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        }),
        h("polyline", {
          points: "16 17 21 12 16 7"
        }),
        h("line", {
          x1: 21,
          y1: 12,
          x2: 9,
          y2: 12
        })
      ],

      sun: [
        h("circle", {
          cx: 12,
          cy: 12,
          r: 4
        }),
        h("path", {
          d: "M12 2v2"
        }),
        h("path", {
          d: "M12 20v2"
        }),
        h("path", {
          d: "m4.93 4.93 1.41 1.41"
        }),
        h("path", {
          d: "m17.66 17.66 1.41 1.41"
        }),
        h("path", {
          d: "M2 12h2"
        }),
        h("path", {
          d: "M20 12h2"
        }),
        h("path", {
          d: "m6.34 17.66-1.41 1.41"
        }),
        h("path", {
          d: "m19.07 4.93-1.41 1.41"
        })
      ],

      arrow: [
        h("path", {
          d: "M5 12h14"
        }),
        h("path", {
          d: "m12 5 7 7-7 7"
        })
      ],

      x: [
        h("path", {
          d: "M18 6 6 18"
        }),
        h("path", {
          d: "m6 6 12 12"
        })
      ],

      play: [
        h("polygon", {
          points: "6 3 20 12 6 21 6 3"
        })
      ],

      link: [
        h("path", {
          d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        }),
        h("path", {
          d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        })
      ]
    };

    return h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: stroke,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        style: {
          flexShrink: 0
        }
      },
      ...(paths[name] || paths.sun)
    );
  }

  /* =======================================================
     UTILITIES
  ======================================================= */

  function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function splitIntoGroups(people, count) {
    if (!people.length) return [];

    const safeCount = Math.max(
      1,
      Math.min(Number(count) || 1, people.length)
    );

    const shuffled = shuffleArray(people);

    const groups = Array.from(
      { length: safeCount },
      () => []
    );

    shuffled.forEach((person, index) => {
      groups[index % safeCount].push(person);
    });

    return groups;
  }

  function makeDuelPairs(people) {
    const shuffled = shuffleArray(people);
    const pairs = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        pairs.push([
          shuffled[i],
          shuffled[i + 1]
        ]);
      } else {
        pairs.push([
          shuffled[i],
          "BYE"
        ]);
      }
    }

    return pairs;
  }

  function formatGroupsForCopy(groups) {
    return groups
      .map((group, index) => {
        return [
          `KELOMPOK ${index + 1}`,
          ...group.map(
            (person, personIndex) =>
              `${personIndex + 1}. ${person}`
          )
        ].join("\n");
      })
      .join("\n\n");
  }

  /* =======================================================
     TOAST
  ======================================================= */

  function Toast({ message }) {
    if (!message) return null;

    return h(
      "div",
      {
        className: "toast-notice"
      },
      message
    );
  }

  /* =======================================================
     HEADER
  ======================================================= */

  function Header({
    user,
    onLogin,
    onLogout
  }) {
    return h(
      "header",
      {
        className: "site-header"
      },

      h(
        "div",
        {
          className: "brand-lockup"
        },

        h(
          "div",
          {
            className: "brand-mark",
            "aria-hidden": "true"
          },
          h("span"),
          h("span"),
          h("span")
        ),

        h(
          "span",
          null,
          "Arunika"
        ),

        h(
          "span",
          {
            className: "brand-light"
          },
          "Mix"
        )
      ),

      h(
        "div",
        {
          className: "header-note"
        },

        h("span", {
          className: "pulse-dot"
        }),

        user
          ? h(
              React.Fragment,
              null,
              h(
                "span",
                null,
                user.email
              ),
              h(
                "button",
                {
                  onClick: onLogout,
                  style: {
                    border: "none",
                    background: "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }
                },
                h(Icon, {
                  name: "logOut",
                  size: 13
                }),
                "Keluar"
              )
            )
          : h(
              "button",
              {
                onClick: onLogin,
                style: {
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontFamily: "inherit"
                }
              },
              h(Icon, {
                name: "cloud",
                size: 13
              }),
              "Cloud"
            )
      )
    );
  }

  /* =======================================================
     HERO
  ======================================================= */

  function Hero({ count }) {
    return h(
      "section",
      {
        className: "hero-wrap"
      },

      h(
        "div",
        {
          className: "hero-copy"
        },

        h(
          "div",
          {
            className: "eyebrow"
          },
          h("span", {
            style: {
              width: "22px",
              height: "1px",
              background: "currentColor",
              display: "inline-block"
            }
          }),
          "PEMBAGI KELOMPOK ACAK"
        ),

        h(
          "h1",
          null,
          "Beri ruang untuk ",
          h(
            "em",
            null,
            "kejutan."
          )
        ),

        h(
          "p",
          null,
          "Atur orang, tentukan jumlah kelompok, lalu biarkan ArunikaMix membuat pembagian yang terasa adil—tanpa perlu ribet."
        )
      ),

      h(
        "div",
        {
          className: "hero-stamp"
        },

        h(
          "div",
          {
            className: "stamp-number"
          },
          count
        ),

        h(
          "div",
          {
            className: "stamp-caption"
          },
          "orang di dalamnya"
        ),

        h(
          "div",
          {
            className: "stamp-line"
          }
        ),

        h(
          "div",
          {
            className: "stamp-caption"
          },
          "satu titik awal yang adil"
        )
      )
    );
  }

  /* =======================================================
     PARTICIPANT PANEL
  ======================================================= */

  function ParticipantPanel({
    people,
    setPeople,
    onNotice
  }) {
    const [input, setInput] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingValue, setEditingValue] = useState("");

    function addPeople() {
      const names = input
        .split("\n")
        .map((name) => name.trim())
        .filter(Boolean);

      if (!names.length) {
        onNotice("Tulis minimal satu nama dulu.");
        return;
      }

      const existing = new Set(
        people.map((person) =>
          person.toLowerCase()
        )
      );

      const unique = names.filter(
        (name) =>
          !existing.has(name.toLowerCase())
      );

      if (!unique.length) {
        onNotice("Nama tersebut sudah ada.");
        return;
      }

      setPeople([
        ...people,
        ...unique
      ]);

      setInput("");

      onNotice(
        `${unique.length} peserta ditambahkan.`
      );
    }

    function deletePerson(index) {
      const name = people[index];

      setPeople(
        people.filter(
          (_, personIndex) =>
            personIndex !== index
        )
      );

      onNotice(
        `${name} dihapus dari daftar.`
      );
    }

    function startEdit(index) {
      setEditingIndex(index);
      setEditingValue(people[index]);
    }

    function saveEdit(index) {
      const value = editingValue.trim();

      if (!value) {
        onNotice("Nama tidak boleh kosong.");
        return;
      }

      const duplicate = people.some(
        (person, personIndex) =>
          personIndex !== index &&
          person.toLowerCase() ===
            value.toLowerCase()
      );

      if (duplicate) {
        onNotice("Nama tersebut sudah ada.");
        return;
      }

      const updated = [...people];
      updated[index] = value;

      setPeople(updated);
      setEditingIndex(null);
      setEditingValue("");

      onNotice("Nama diperbarui.");
    }

    return h(
      "section",
      {
        className: "panel"
      },

      h(
        "div",
        {
          className: "section-kicker"
        },
        h(Icon, {
          name: "users",
          size: 13
        }),
        "PESERTA"
      ),

      h(
        "div",
        {
          className: "panel-heading"
        },

        h(
          "h2",
          null,
          "Siapa saja?"
        ),

        h(
          "span",
          {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--ink-soft)"
            }
          },
          people.length,
          " orang"
        )
      ),

      h(
        "p",
        {
          className: "panel-intro"
        },
        "Tambahkan nama satu per baris. Kamu bisa mengedit atau menghapusnya kapan saja."
      ),

      h(
        "textarea",
        {
          value: input,
          onChange: (e) =>
            setInput(e.target.value),
          placeholder:
            "Tulis nama peserta di sini...\nSatu nama per baris",
          rows: 4,
          style: {
            width: "100%",
            resize: "vertical",
            border: "1px solid var(--line)",
            borderRadius: "9px",
            padding: "11px 12px",
            fontSize: "13px",
            marginBottom: "10px"
          }
        }
      ),

      h(
        "button",
        {
          className: "copy-button",
          onClick: addPeople,
          style: {
            width: "100%",
            marginBottom: "15px"
          }
        },
        h(Icon, {
          name: "plus",
          size: 15
        }),
        "Tambah peserta"
      ),

      h(
        "div",
        {
          className: "participant-list"
        },

        people.length
          ? people.map((person, index) =>
              h(
                "div",
                {
                  className: "participant-row",
                  key:
                    person +
                    "-" +
                    index
                },

                h(
                  "span",
                  {
                    className:
                      "person-number"
                  },
                  String(
                    index + 1
                  ).padStart(2, "0")
                ),

                editingIndex === index
                  ? h(
                      React.Fragment,
                      null,

                      h("input", {
                        className:
                          "edit-input",
                        value:
                          editingValue,
                        autoFocus: true,
                        onChange: (e) =>
                          setEditingValue(
                            e.target.value
                          ),
                        onKeyDown: (e) => {
                          if (
                            e.key ===
                            "Enter"
                          ) {
                            saveEdit(index);
                          }

                          if (
                            e.key ===
                            "Escape"
                          ) {
                            setEditingIndex(
                              null
                            );
                          }
                        }
                      }),

                      h(
                        "button",
                        {
                          className:
                            "row-action",
                          onClick: () =>
                            saveEdit(
                              index
                            ),
                          title: "Simpan"
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
                        {
                          className:
                            "person-name"
                        },
                        person
                      ),

                      h(
                        "div",
                        {
                          className:
                            "row-actions"
                        },

                        h(
                          "button",
                          {
                            className:
                              "row-action",
                            onClick: () =>
                              startEdit(
                                index
                              ),
                            title:
                              "Edit nama"
                          },
                          h(Icon, {
                            name: "edit",
                            size: 14
                          })
                        ),

                        h(
                          "button",
                          {
                            className:
                              "row-action delete-action",
                            onClick: () =>
                              deletePerson(
                                index
                              ),
                            title:
                              "Hapus"
                          },
                          h(Icon, {
                            name: "trash",
                            size: 14
                          })
                        )
                      )
                    )
              )
            )
          : h(
              "div",
              {
                style: {
                  textAlign: "center",
                  padding: "20px",
                  color:
                    "var(--ink-soft)",
                  fontSize: "13px"
                }
              },
              "Belum ada peserta."
            )
      ),

      h(
        "div",
        {
          style: {
            display: "flex",
            gap: "7px",
            marginTop: "10px"
          }
        },

        h(
          "button",
          {
            className: "copy-button",
            onClick: () => {
              setPeople([]);
              onNotice(
                "Semua peserta dihapus."
              );
            },
            style: {
              flex: 1
            }
          },
          h(Icon, {
            name: "trash",
            size: 13
          }),
          "Kosongkan"
        ),

        h(
          "button",
          {
            className: "copy-button",
            onClick: () => {
              setPeople([
                ...ORIGINAL_PEOPLE
              ]);
              onNotice(
                "Daftar awal dipulihkan."
              );
            },
            style: {
              flex: 1
            }
          },
          h(Icon, {
            name: "rotate",
            size: 13
          }),
          "Reset awal"
        )
      )
    );
  }

  /* =======================================================
     MIX PANEL
  ======================================================= */

  function MixPanel({
    people,
    groupCount,
    setGroupCount,
    onShuffle,
    disabled
  }) {
    const maxGroups = Math.max(
      1,
      Math.min(8, people.length || 1)
    );

    return h(
      "section",
      {
        className: "mix-panel"
      },

      h(
        "div",
        {
          className: "section-kicker"
        },
        h(Icon, {
          name: "shuffle",
          size: 13
        }),
        "MIX"
      ),

      h(
        "div",
        {
          className: "mix-topline"
        },

        h(
          "h2",
          null,
          "Buat pembagian"
        ),

        h(
          "span",
          {
            style: {
              fontFamily:
                "var(--font-mono)",
              fontSize: "11px",
              color:
                "var(--ink-soft)"
            }
          },
          `${groupCount} kelompok`
        )
      ),

      h(
        "p",
        {
          className:
            "mix-description"
        },
        "ArunikaMix akan mengacak peserta dan membaginya seimbang sebanyak mungkin."
      ),

      h(
        "div",
        {
          className:
            "balance-note"
        },

        h(
          "span",
          {
            className:
              "balance-mark"
          },
          "✦"
        ),

        h(
          "span",
          null,
          people.length
            ? `${people.length} peserta`
            : "Belum ada peserta"
        ),

        h("span", {
          className:
            "balance-divider"
        }),

        h(
          "span",
          null,
          people.length
            ? `± ${Math.ceil(
                people.length /
                  groupCount
              )} orang / kelompok`
            : "Tambahkan peserta"
        )
      ),

      h(
        "label",
        {
          style: {
            display: "block",
            fontSize: "12px",
            fontFamily:
              "var(--font-mono)",
            color:
              "var(--ink-soft)",
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
            gap: "10px",
            marginBottom: "18px"
          }
        },

        h(
          "button",
          {
            className: "icon-button",
            onClick: () =>
              setGroupCount(
                Math.max(
                  1,
                  groupCount - 1
                )
              ),
            disabled:
              groupCount <= 1
          },
          "−"
        ),

        h(
          "div",
          {
            style: {
              flex: 1,
              textAlign: "center",
              fontFamily:
                "var(--font-display)",
              fontSize: "31px",
              color:
                "var(--plum)"
            }
          },
          groupCount
        ),

        h(
          "button",
          {
            className: "icon-button",
            onClick: () =>
              setGroupCount(
                Math.min(
                  maxGroups,
                  groupCount + 1
                )
              ),
            disabled:
              groupCount >= maxGroups
          },
          "+"
        )
      ),

      h(
        "input",
        {
          type: "range",
          min: 1,
          max: maxGroups,
          value: groupCount,
          onChange: (e) =>
            setGroupCount(
              Number(e.target.value)
            ),
          style: {
            width: "100%",
            accentColor:
              "var(--plum)",
            marginBottom: "22px"
          }
        }
      ),

      h(
        "button",
        {
          className:
            "shuffle-button",
          onClick: onShuffle,
          disabled: disabled
        },

        h(Icon, {
          name: "shuffle",
          size: 17
        }),

        disabled
          ? "Tambahkan peserta dulu"
          : "Acak & bagi kelompok"
      )
    );
  }

  /* =======================================================
     GROUP RESULTS
  ======================================================= */

  function Results({
    groups,
    onCopy,
    history,
    onHistorySelect
  }) {
    if (!groups.length) {
      return h(
        "section",
        {
          className:
            "results-section"
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
              h(Icon, {
                name: "users",
                size: 13
              }),
              "HASIL"
            ),
            h(
              "h2",
              null,
              "Kelompokmu"
            )
          )
        ),

        h(
          "div",
          {
            className:
              "result-empty"
          },

          h(
            "div",
            {
              className:
                "empty-sun"
            },
            h(Icon, {
              name: "sun",
              size: 20
            })
          ),

          h(
            "p",
            null,
            "Hasil acakan akan muncul di sini."
          )
        )
      );
    }

    return h(
      "section",
      {
        className:
          "results-section"
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
            h(Icon, {
              name: "check",
              size: 13
            }),
            "HASIL ACAKAN"
          ),

          h(
            "h2",
            null,
            "Kelompokmu"
          )
        ),

        h(
          "button",
          {
            className:
              "copy-button",
            onClick: onCopy
          },
          h(Icon, {
            name: "copy",
            size: 14
          }),
          "Salin hasil"
        )
      ),

      h(
        "div",
        {
          className:
            "groups-grid"
        },

        groups.map(
          (group, index) => {
            const color =
              GROUP_COLORS[
                index %
                  GROUP_COLORS.length
              ];

            return h(
              "div",
              {
                className:
                  `group-card group-${color}`,
                key:
                  `${index}-${group.join("-")}`
              },

              h(
                "div",
                {
                  className:
                    "group-card-head"
                },

                h(
                  "span",
                  {
                    className:
                      "group-number"
                  },
                  `0${index + 1}`
                ),

                h(
                  "span",
                  null,
                  GROUP_LABELS[
                    index %
                      GROUP_LABELS.length
                  ]
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
                  className:
                    "group-names"
                },

                group.map(
                  (person, personIndex) =>
                    h(
                      "div",
                      {
                        className:
                          "group-person",
                        key:
                          person +
                          personIndex
                      },

                      h("span", {
                        className:
                          "member-dot"
                      }),

                      h(
                        "span",
                        null,
                        person
                      )
                    )
                )
              )
            );
          }
        )
      ),

      history.length > 0
        ? h(
            "div",
            {
              style: {
                marginTop: "22px",
                borderTop:
                  "1px solid var(--line)",
                paddingTop: "15px"
              }
            },

            h(
              "div",
              {
                style: {
                  fontFamily:
                    "var(--font-mono)",
                  fontSize: "10px",
                  color:
                    "var(--ink-soft)",
                  marginBottom: "8px",
                  letterSpacing:
                    "0.5px"
                }
              },
              "RIWAYAT ACAKAN"
            ),

            h(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "7px",
                  flexWrap: "wrap"
                }
              },

              history
                .slice(0, 5)
                .map(
                  (item, index) =>
                    h(
                      "button",
                      {
                        key: index,
                        className:
                          "copy-button",
                        onClick: () =>
                          onHistorySelect(
                            item.groups
                          )
                      },
                      `Acakan ${
                        history.length -
                        index
                      }`
                    )
                )
            )
          )
        : null
    );
  }

  /* =======================================================
     EXTRA TOOLS
  ======================================================= */

  function ExtraTools({
    people,
    onNotice
  }) {
    const [tab, setTab] =
      useState("duel");

    const [wheelPool, setWheelPool] =
      useState([...people]);

    const [wheelWinner, setWheelWinner] =
      useState(null);

    const [removeWinner, setRemoveWinner] =
      useState(false);

    const [duels, setDuels] =
      useState([]);

    const [queue, setQueue] =
      useState([]);

    useEffect(() => {
      setWheelPool([...people]);
    }, [people]);

    function spin() {
      if (!wheelPool.length) {
        onNotice(
          "Tidak ada peserta untuk roda putar."
        );
        return;
      }

      const winner =
        wheelPool[
          Math.floor(
            Math.random() *
              wheelPool.length
          )
        ];

      setWheelWinner(winner);

      if (removeWinner) {
        setWheelPool(
          wheelPool.filter(
            (person) =>
              person !== winner
          )
        );
      }

      onNotice(
        `${winner} terpilih!`
      );
    }

    function makeDuels() {
      if (people.length < 2) {
        onNotice(
          "Minimal dua peserta untuk duel."
        );
        return;
      }

      setDuels(
        makeDuelPairs(people)
      );
    }

    function makeQueue() {
      if (!people.length) {
        onNotice(
          "Belum ada peserta."
        );
        return;
      }

      setQueue(
        shuffleArray(people)
      );
    }

    return h(
      "section",
      {
        className:
          "results-section",
        style: {
          marginBottom: "25px"
        }
      },

      h(
        "div",
        {
          style: {
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "20px"
          }
        },

        [
          ["duel", "Duel"],
          ["wheel", "Roda Putar"],
          ["queue", "Antrean"]
        ].map(
          ([value, label]) =>
            h(
              "button",
              {
                key: value,
                className:
                  "copy-button",
                onClick: () =>
                  setTab(value),
                style:
                  tab === value
                    ? {
                        background:
                          "var(--plum)",
                        color: "#fff",
                        borderColor:
                          "var(--plum)"
                      }
                    : null
              },
              label
            )
        )
      ),

      tab === "duel"
        ? h(
            React.Fragment,
            null,

            h(
              "div",
              {
                className:
                  "section-kicker"
              },
              "UNDIAN BERPASANGAN"
            ),

            h(
              "h2",
              {
                style: {
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "27px",
                  marginBottom: "7px"
                }
              },
              "Siapa lawan siapa?"
            ),

            h(
              "p",
              {
                className:
                  "mix-description"
              },
              "Acak peserta menjadi pasangan secara cepat."
            ),

            h(
              "button",
              {
                className:
                  "shuffle-button",
                onClick: makeDuels
              },
              h(Icon, {
                name: "shuffle",
                size: 17
              }),
              "Acak pasangan"
            ),

            duels.length
              ? h(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit,minmax(220px,1fr))",
                      gap: "10px",
                      marginTop: "16px"
                    }
                  },
                  duels.map(
                    (pair, index) =>
                      h(
                        "div",
                        {
                          key: index,
                          style: {
                            border:
                              "1px solid var(--line)",
                            borderRadius:
                              "10px",
                            padding:
                              "13px",
                            background:
                              "rgba(250,246,237,.9)"
                          }
                        },
                        h(
                          "div",
                          {
                            style: {
                              fontFamily:
                                "var(--font-mono)",
                              fontSize:
                                "10px",
                              color:
                                "var(--ink-soft)",
                              marginBottom:
                                "7px"
                            }
                          },
                          `DUEL ${
                            index + 1
                          }`
                        ),
                        h(
                          "strong",
                          null,
                          pair[0]
                        ),
                        h(
                          "div",
                          {
                            style: {
                              textAlign:
                                "center",
                              margin:
                                "5px 0",
                              color:
                                "var(--coral)"
                            }
                          },
                          "VS"
                        ),
                        h(
                          "strong",
                          null,
                          pair[1]
                        )
                      )
                  )
                )
              : null
          )

        : tab === "wheel"
        ? h(
            React.Fragment,
            null,

            h(
              "div",
              {
                className:
                  "section-kicker"
              },
              "RODA PUTAR"
            ),

            h(
              "h2",
              {
                style: {
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "27px",
                  marginBottom: "7px"
                }
              },
              "Pilih satu orang"
            ),

            h(
              "p",
              {
                className:
                  "mix-description"
              },
              "Cocok untuk menentukan siapa yang mulai, presentasi, atau mendapat giliran."
            ),

            h(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  marginBottom: "14px"
                }
              },

              h(
                "input",
                {
                  type: "checkbox",
                  checked:
                    removeWinner,
                  onChange: (e) =>
                    setRemoveWinner(
                      e.target.checked
                    ),
                  id: "removeWinner"
                }
              ),

              h(
                "label",
                {
                  htmlFor:
                    "removeWinner",
                  style: {
                    fontSize: "12px",
                    color:
                      "var(--ink-soft)"
                  }
                },
                "Hapus pemenang dari putaran berikutnya"
              )
            ),

            h(
              "button",
              {
                className:
                  "shuffle-button",
                onClick: spin,
                disabled:
                  !wheelPool.length
              },
              h(Icon, {
                name: "play",
                size: 15
              }),
              wheelPool.length
                ? "Putar roda"
                : "Semua sudah terpilih"
            ),

            wheelWinner
              ? h(
                  "div",
                  {
                    style: {
                      textAlign:
                        "center",
                      marginTop:
                        "18px",
                      padding:
                        "25px 15px",
                      border:
                        "1px solid var(--line)",
                      borderRadius:
                        "12px",
                      background:
                        "rgba(250,246,237,.9)"
                    }
                  },

                  h(
                    "div",
                    {
                      style: {
                        fontFamily:
                          "var(--font-mono)",
                        fontSize:
                          "10px",
                        color:
                          "var(--ink-soft)",
                        letterSpacing:
                          "0.7px",
                        marginBottom:
                          "7px"
                      }
                    },
                    "TERPILIH"
                  ),

                  h(
                    "div",
                    {
                      style: {
                        fontFamily:
                          "var(--font-display)",
                        fontSize:
                          "32px",
                        color:
                          "var(--coral)"
                      }
                    },
                    wheelWinner
                  )
                )
              : null
          )

        : h(
            React.Fragment,
            null,

            h(
              "div",
              {
                className:
                  "section-kicker"
              },
              "URUTAN ANTREAN"
            ),

            h(
              "h2",
              {
                style: {
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "27px",
                  marginBottom: "7px"
                }
              },
              "Siapa duluan?"
            ),

            h(
              "p",
              {
                className:
                  "mix-description"
              },
              "Buat urutan giliran secara acak."
            ),

            h(
              "button",
              {
                className:
                  "shuffle-button",
                onClick: makeQueue
              },
              h(Icon, {
                name: "shuffle",
                size: 17
              }),
              "Acak urutan"
            ),

            queue.length
              ? h(
                  "div",
                  {
                    style: {
                      marginTop: "16px",
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: "6px"
                    }
                  },

                  queue.map(
                    (person, index) =>
                      h(
                        "div",
                        {
                          key:
                            person +
                            index,
                          className:
                            "participant-row"
                        },

                        h(
                          "span",
                          {
                            className:
                              "person-number"
                          },
                          String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )
                        ),

                        h(
                          "span",
                          {
                            className:
                              "person-name"
                          },
                          person
                        )
                      )
                  )
                )
              : null
          )
    );
  }

  /* =======================================================
     AUTH MODAL
  ======================================================= */

  function AuthModal({
    onClose,
    onNotice
  }) {
    const [
      isSignUp,
      setIsSignUp
    ] = useState(false);

    const [
      email,
      setEmail
    ] = useState("");

    const [
      password,
      setPassword
    ] = useState("");

    const [
      loading,
      setLoading
    ] = useState(false);

    async function submit(e) {
      e.preventDefault();

      if (!supabaseClient) {
        onNotice(
          "Cloud belum tersedia."
        );
        return;
      }

      if (!email || !password) {
        onNotice(
          "Email dan password wajib diisi."
        );
        return;
      }

      setLoading(true);

      try {
        if (isSignUp) {
          const redirectUrl =
            window.location.origin +
            window.location.pathname;

          const result =
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

          if (result.error) {
            throw result.error;
          }

          onNotice(
            "Pendaftaran berhasil! Cek email untuk konfirmasi."
          );

          setIsSignUp(false);
        } else {
          const result =
            await supabaseClient.auth.signInWithPassword(
              {
                email,
                password
              }
            );

          if (result.error) {
            throw result.error;
          }

          onNotice(
            "Berhasil masuk akun!"
          );

          onClose();
        }
      } catch (error) {
        onNotice(
          error.message ||
            "Terjadi kesalahan."
        );
      } finally {
        setLoading(false);
      }
    }

    return h(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          background:
            "rgba(48,35,51,.25)",
          zIndex: 100000,
          display: "grid",
          placeItems: "center",
          padding: "20px"
        },
        onMouseDown: (e) => {
          if (
            e.target ===
            e.currentTarget
          ) {
            onClose();
          }
        }
      },

      h(
        "div",
        {
          style: {
            width: "100%",
            maxWidth: "410px",
            background:
              "var(--paper-light)",
            border:
              "1px solid var(--line)",
            borderRadius: "18px",
            padding: "28px",
            boxShadow:
              "0 20px 60px rgba(48,35,51,.18)"
          }
        },

        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: "18px"
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
              "ARUNIKAMIX CLOUD"
            ),

            h(
              "h2",
              {
                style: {
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "28px"
                }
              },
              isSignUp
                ? "Buat akun"
                : "Masuk"
            )
          ),

          h(
            "button",
            {
              className:
                "icon-button",
              onClick: onClose
            },
            h(Icon, {
              name: "x",
              size: 16
            })
          )
        ),

        h(
          "form",
          {
            onSubmit: submit
          },

          h(
            "label",
            {
              style: {
                display: "block",
                fontSize: "11px",
                fontFamily:
                  "var(--font-mono)",
                color:
                  "var(--ink-soft)",
                marginBottom: "6px"
              }
            },
            "EMAIL"
          ),

          h(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) =>
                setEmail(
                  e.target.value
                ),
              placeholder:
                "kamu@email.com",
              style: {
                width: "100%",
                padding:
                  "11px 12px",
                border:
                  "1px solid var(--line)",
                borderRadius: "9px",
                marginBottom:
                  "12px",
                background:
                  "var(--paper-light)"
              }
            }
          ),

          h(
            "label",
            {
              style: {
                display: "block",
                fontSize: "11px",
                fontFamily:
                  "var(--font-mono)",
                color:
                  "var(--ink-soft)",
                marginBottom: "6px"
              }
            },
            "PASSWORD"
          ),

          h(
            "input",
            {
              type: "password",
              value: password,
              onChange: (e) =>
                setPassword(
                  e.target.value
                ),
              placeholder:
                "••••••••",
              style: {
                width: "100%",
                padding:
                  "11px 12px",
                border:
                  "1px solid var(--line)",
                borderRadius: "9px",
                marginBottom:
                  "15px",
                background:
                  "var(--paper-light)"
              }
            }
          ),

          h(
            "button",
            {
              className:
                "shuffle-button",
              type: "submit",
              disabled: loading
            },
            h(Icon, {
              name: "logIn",
              size: 16
            }),
            loading
              ? "Tunggu..."
              : isSignUp
              ? "Daftar"
              : "Masuk"
          )
        ),

        h(
          "button",
          {
            onClick: () =>
              setIsSignUp(
                !isSignUp
              ),
            style: {
              width: "100%",
              marginTop: "12px",
              border: "none",
              background:
                "transparent",
              color:
                "var(--ink-soft)",
              fontSize: "12px",
              cursor: "pointer"
            }
          },
          isSignUp
            ? "Sudah punya akun? Masuk"
            : "Belum punya akun? Daftar"
        )
      )
    );
  }

  /* =======================================================
     APP
  ======================================================= */

  function App() {
    const [
      people,
      setPeople
    ] = useState([
      ...ORIGINAL_PEOPLE
    ]);

    const [
      groupCount,
      setGroupCount
    ] = useState(4);

    const [
      groups,
      setGroups
    ] = useState([]);

    const [
      history,
      setHistory
    ] = useState([]);

    const [
      toast,
      setToast
    ] = useState("");

    const [
      user,
      setUser
    ] = useState(null);

    const [
      showAuth,
      setShowAuth
    ] = useState(false);

    function showNotice(message) {
      setToast(message);

      window.clearTimeout(
        showNotice.timer
      );

      showNotice.timer =
        window.setTimeout(
          () => {
            setToast("");
          },
          3000
        );
    }

    useEffect(() => {
      if (!supabaseClient) return;

      supabaseClient.auth
        .getSession()
        .then(({ data }) => {
          setUser(
            data?.session?.user ||
              null
          );
        });

      const {
        data: listener
      } =
        supabaseClient.auth.onAuthStateChange(
          (_event, session) => {
            setUser(
              session?.user || null
            );
          }
        );

      return () => {
        listener?.subscription?.unsubscribe();
      };
    }, []);

    const canShuffle =
      people.length >= 1;

    function shuffleGroups() {
      if (!people.length) {
        showNotice(
          "Tambahkan peserta dulu."
        );
        return;
      }

      const result =
        splitIntoGroups(
          people,
          groupCount
        );

      setGroups(result);

      setHistory((prev) => [
        {
          groups: result,
          createdAt:
            Date.now()
        },
        ...prev
      ].slice(0, 8));

      showNotice(
        `${people.length} peserta dibagi menjadi ${groupCount} kelompok.`
      );

      window.setTimeout(() => {
        const element =
          document.querySelector(
            ".results-section"
          );

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 50);
    }

    async function copyGroups() {
      if (!groups.length) return;

      const text =
        formatGroupsForCopy(
          groups
        );

      try {
        await navigator.clipboard.writeText(
          text
        );

        showNotice(
          "Hasil berhasil disalin."
        );
      } catch (error) {
        showNotice(
          "Gagal menyalin hasil."
        );
      }
    }

    async function logout() {
      if (!supabaseClient) return;

      await supabaseClient.auth.signOut();

      showNotice(
        "Berhasil keluar."
      );
    }

    function selectHistory(selected) {
      setGroups(selected);

      showNotice(
        "Riwayat acakan dipulihkan."
      );
    }

    return h(
      React.Fragment,
      null,

      h(
        "div",
        {
          className:
            "app-shell"
        },

        h("div", {
          className:
            "ambient-orb ambient-orb-one"
        }),

        h("div", {
          className:
            "ambient-orb ambient-orb-two"
        }),

        h(Header, {
          user,
          onLogin: () =>
            setShowAuth(true),
          onLogout: logout
        }),

        h(Hero, {
          count: people.length
        }),

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
                people,
                setPeople,
                onNotice:
                  showNotice
              }
            ),

            h(
              MixPanel,
              {
                people,
                groupCount,
                setGroupCount,
                onShuffle:
                  shuffleGroups,
                disabled:
                  !canShuffle
              }
            )
          ),

          h(Results, {
            groups,
            onCopy:
              copyGroups,
            history,
            onHistorySelect:
              selectHistory
          }),

          h(ExtraTools, {
            people,
            onNotice:
              showNotice
          })
        ),

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
                  "var(--font-mono)",
                fontSize: "10px"
              }
            },
            supabaseClient
              ? "SUPABASE CLOUD ACTIVE"
              : "LOCAL MODE"
          )
        )
      ),

      showAuth
        ? h(AuthModal, {
            onClose: () =>
              setShowAuth(false),
            onNotice:
              showNotice
          })
        : null,

      h(Toast, {
        message: toast
      })
    );
  }

  /* =======================================================
     START APP
  ======================================================= */

  const rootElement =
    document.getElementById(
      "root"
    );

  if (!rootElement) {
    console.error(
      "ArunikaMix: #root tidak ditemukan."
    );
    return;
  }

  try {
    const root =
      ReactDOM.createRoot(
        rootElement
      );

    root.render(
      h(App)
    );
  } catch (error) {
    console.error(
      "ArunikaMix gagal dirender:",
      error
    );

    rootElement.innerHTML = `
      <div style="
        padding:40px;
        font-family:Arial,sans-serif;
        color:#302333;
      ">
        <h2>ArunikaMix mengalami error</h2>
        <p>${String(
          error.message ||
            error
        )}</p>
      </div>
    `;
  }
})();
