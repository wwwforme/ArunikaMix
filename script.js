const {
  useState,
  useEffect
} = React;


/* ================================
   DATA
================================ */

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

const COLORS = [
  "#EE806C",
  "#EDB949",
  "#4C9382",
  "#4B334D",
  "#78A8C8",
  "#D77A9B",
  "#78A890",
  "#B28B54"
];


/* ================================
   HELPERS
================================ */

function createPerson(name) {
  return {
    id:
      Date.now().toString(36) +
      Math.random().toString(36).slice(2),
    name
  };
}

function shuffle(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j]
    ] = [
      result[j],
      result[i]
    ];
  }

  return result;
}


/* ================================
   APP
================================ */

function App() {

  const [
    participants,
    setParticipants
  ] = useState(
    ORIGINAL_PARTICIPANTS.map(
      createPerson
    )
  );

  const [
    groupCount,
    setGroupCount
  ] = useState(4);

  const [
    groups,
    setGroups
  ] = useState([]);

  const [
    activeTab,
    setActiveTab
  ] = useState("groups");

  const [
    newName,
    setNewName
  ] = useState("");

  const [
    notice,
    setNotice
  ] = useState("");


  /* ================================
     NOTICE
  ================================= */

  function showNotice(message) {
    setNotice(message);

    setTimeout(() => {
      setNotice("");
    }, 2500);
  }


  /* ================================
     ADD PERSON
  ================================= */

  function addPerson() {

    const name =
      newName.trim();

    if (!name) {
      showNotice(
        "Masukkan nama terlebih dahulu."
      );
      return;
    }

    setParticipants(prev => [
      ...prev,
      createPerson(name)
    ]);

    setNewName("");

    showNotice(
      "Peserta ditambahkan."
    );
  }


  /* ================================
     REMOVE PERSON
  ================================= */

  function removePerson(id) {

    setParticipants(prev =>
      prev.filter(
        person =>
          person.id !== id
      )
    );

    showNotice(
      "Peserta dihapus."
    );
  }


  /* ================================
     RESET
  ================================= */

  function resetParticipants() {

    setParticipants(
      ORIGINAL_PARTICIPANTS.map(
        createPerson
      )
    );

    setGroups([]);

    showNotice(
      "Daftar dikembalikan ke awal."
    );
  }


  /* ================================
     CREATE GROUPS
  ================================= */

  function createGroups() {

    if (
      participants.length < 2
    ) {
      showNotice(
        "Minimal ada 2 peserta."
      );
      return;
    }

    const shuffled =
      shuffle(participants);

    const result =
      Array.from(
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

    showNotice(
      "Kelompok berhasil diacak."
    );
  }


  /* ================================
     RENDER GROUPS
  ================================= */

  function GroupsPage() {

    return React.createElement(
      "div",
      {
        className:
          "arunika-tool"
      },

      React.createElement(
        "div",
        {
          className:
            "tool-heading"
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
            "Biarkan ArunikaMix membuat pembagian secara acak."
          )
        ),

        React.createElement(
          "div",
          {
            className:
              "group-selector"
          },

          React.createElement(
            "span",
            null,
            "Kelompok"
          ),

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
                    participants.length,
                    groupCount + 1
                  )
                )
            },
            "+"
          )
        )
      ),

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick:
            createGroups
        },
        "↝  Acak kelompok"
      ),

      groups.length > 0

        ? React.createElement(
            "div",
            {
              className:
                "groups-grid"
            },

            groups.map(
              (group, groupIndex) =>
                React.createElement(
                  "div",
                  {
                    className:
                      "group-card",
                    key:
                      groupIndex
                  },

                  React.createElement(
                    "div",
                    {
                      className:
                        "group-card-header"
                    },

                    React.createElement(
                      "div",
                      null,

                      React.createElement(
                        "span",
                        {
                          className:
                            "group-number"
                        },
                        `KELOMPOK ${
                          groupIndex + 1
                        }`
                      ),

                      React.createElement(
                        "h3",
                        null,
                        [
                          "Coral",
                          "Saffron",
                          "Teal",
                          "Plum",
                          "Sky",
                          "Rose",
                          "Mint",
                          "Ochre"
                        ][
                          groupIndex %
                            8
                        ]
                      )
                    )
                  ),

                  React.createElement(
                    "div",
                    {
                      className:
                        "group-members"
                    },

                    group.map(
                      (
                        person,
                        index
                      ) =>
                        React.createElement(
                          "div",
                          {
                            className:
                              "group-member",
                            key:
                              person.id
                          },

                          React.createElement(
                            "span",
                            {
                              className:
                                "member-number"
                            },
                            String(
                              index + 1
                            ).padStart(
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
              "strong",
              null,
              "Belum ada hasil."
            ),

            React.createElement(
              "span",
              null,
              "Tekan “Acak kelompok” untuk mulai."
            )
          )
    );
  }


  /* ================================
     WHEEL PAGE
  ================================= */

  function WheelPage() {

    const [
      winner,
      setWinner
    ] = useState(null);

    function spin() {

      if (!participants.length) {
        showNotice(
          "Tidak ada peserta."
        );
        return;
      }

      const selected =
        participants[
          Math.floor(
            Math.random() *
              participants.length
          )
        ];

      setWinner(selected);

      showNotice(
        `${selected.name} terpilih.`
      );
    }

    return React.createElement(
      "div",
      {
        className:
          "arunika-tool"
      },

      React.createElement(
        "span",
        {
          className:
            "eyebrow"
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
        "Satu putaran. Satu nama."
      ),

      React.createElement(
        "div",
        {
          className:
            "simple-wheel"
        },

        winner

          ? React.createElement(
              React.Fragment,
              null,

              React.createElement(
                "small",
                null,
                "HASIL"
              ),

              React.createElement(
                "strong",
                null,
                winner.name
              )
            )

          : React.createElement(
              "strong",
              null,
              "?"
            )
      ),

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick: spin
        },
        "Putar roda"
      )
    );
  }


  /* ================================
     DUEL PAGE
  ================================= */

  function DuelPage() {

    const [
      pairs,
      setPairs
    ] = useState([]);

    function createPairs() {

      const shuffled =
        shuffle(participants);

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

      showNotice(
        "Pasangan berhasil diacak."
      );
    }

    return React.createElement(
      "div",
      {
        className:
          "arunika-tool"
      },

      React.createElement(
        "span",
        {
          className:
            "eyebrow"
        },
        "DUEL MODE"
      ),

      React.createElement(
        "h2",
        null,
        "Undian berpasangan."
      ),

      React.createElement(
        "p",
        null,
        "Cari pasangan secara acak."
      ),

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick:
            createPairs
        },
        "Acak pasangan"
      ),

      React.createElement(
        "div",
        {
          className:
            "duel-grid"
        },

        pairs.map(
          (pair, index) =>
            React.createElement(
              "div",
              {
                className:
                  "duel-card",
                key: index
              },

              React.createElement(
                "strong",
                null,
                pair[0].name
              ),

              React.createElement(
                "span",
                null,
                "VS"
              ),

              React.createElement(
                "strong",
                null,
                pair[1].name
              )
            )
        )
      )
    );
  }


  /* ================================
     QUEUE PAGE
  ================================= */

  function QueuePage() {

    const [
      queue,
      setQueue
    ] = useState([]);

    function createQueue() {

      setQueue(
        shuffle(participants)
      );

      showNotice(
        "Urutan berhasil diacak."
      );
    }

    return React.createElement(
      "div",
      {
        className:
          "arunika-tool"
      },

      React.createElement(
        "span",
        {
          className:
            "eyebrow"
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
        "Acak urutan giliran."
      ),

      React.createElement(
        "button",
        {
          className:
            "primary-button large",
          onClick:
            createQueue
        },
        "Acak urutan"
      ),

      React.createElement(
        "div",
        {
          className:
            "queue-list"
        },

        queue.map(
          (person, index) =>
            React.createElement(
              "div",
              {
                className:
                  "queue-item",
                key:
                  person.id
              },

              React.createElement(
                "strong",
                null,
                String(
                  index + 1
                ).padStart(
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


  /* ================================
     TOOL
  ================================= */

  let activeTool;

  if (
    activeTab === "wheel"
  ) {
    activeTool =
      React.createElement(
        WheelPage
      );

  } else if (
    activeTab === "duel"
  ) {
    activeTool =
      React.createElement(
        DuelPage
      );

  } else if (
    activeTab === "queue"
  ) {
    activeTool =
      React.createElement(
        QueuePage
      );

  } else {
    activeTool =
      React.createElement(
        GroupsPage
      );
  }


  /* ================================
     APP UI
  ================================= */

  return React.createElement(
    React.Fragment,
    null,

    React.createElement(
      "div",
      {
        className:
          "app-shell"
      },

      /* HEADER */

      React.createElement(
        "header",
        {
          className:
            "topbar"
        },

        React.createElement(
          "div",
          {
            className:
              "brand-lockup"
          },

          React.createElement(
            "div",
            {
              className:
                "brand-mark"
            },

            React.createElement(
              "span",
              {
                style: {
                  transform:
                    "rotate(-8deg)"
                }
              }
            ),

            React.createElement(
              "span",
              {
                style: {
                  transform:
                    "rotate(5deg)"
                }
              }
            ),

            React.createElement(
              "span",
              {
                style: {
                  transform:
                    "rotate(-12deg)"
                }
              }
            )
          ),

          React.createElement(
            "strong",
            null,
            "ArunikaMix"
          )
        ),

        React.createElement(
          "span",
          {
            className:
              "topbar-status"
          },
          "LOKAL SAJA"
        )
      ),


      /* HERO */

      React.createElement(
        "section",
        {
          className:
            "hero-wrap"
        },

        React.createElement(
          "div",
          {
            className:
              "hero-copy"
          },

          React.createElement(
            "h1",
            null,
            "Beri ruang ",
            React.createElement(
              "em",
              null,
              "untuk kejutan."
            )
          ),

          React.createElement(
            "p",
            null,
            "Pembagi kelompok acak & mini games."
          )
        ),

        React.createElement(
          "div",
          {
            className:
              "hero-stamp"
          },

          React.createElement(
            "strong",
            {
              className:
                "stamp-number"
            },
            participants.length
          ),

          React.createElement(
            "span",
            {
              className:
                "stamp-caption"
            },
            "orang di dalamnya"
          ),

          React.createElement(
            "div",
            {
              className:
                "stamp-line"
            }
          ),

          React.createElement(
            "span",
            {
              className:
                "stamp-caption"
            },
            "satu titik awal yang adil"
          )
        )
      ),


      /* TABS */

      React.createElement(
        "nav",
        {
          className:
            "tab-navigation"
        },

        React.createElement(
          "button",
          {
            className:
              activeTab === "groups"
                ? "tab-button active"
                : "tab-button",
            onClick: () =>
              setActiveTab(
                "groups"
              )
          },
          "Pembagi Kelompok"
        ),

        React.createElement(
          "button",
          {
            className:
              activeTab === "wheel"
                ? "tab-button active"
                : "tab-button",
            onClick: () =>
              setActiveTab(
                "wheel"
              )
          },
          "Roda Putar"
        ),

        React.createElement(
          "button",
          {
            className:
              activeTab === "duel"
                ? "tab-button active"
                : "tab-button",
            onClick: () =>
              setActiveTab(
                "duel"
              )
          },
          "Undian Berpasangan"
        ),

        React.createElement(
          "button",
          {
            className:
              activeTab === "queue"
                ? "tab-button active"
                : "tab-button",
            onClick: () =>
              setActiveTab(
                "queue"
              )
          },
          "Urutan Antrean"
        )
      ),


      /* WORKSPACE */

      React.createElement(
        "div",
        {
          className:
            "workspace"
        },

        /* SIDEBAR */

        React.createElement(
          "aside",
          {
            className:
              "sidebar"
          },

          React.createElement(
            "div",
            {
              className:
                "participant-panel"
            },

            React.createElement(
              "div",
              {
                className:
                  "panel-heading"
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
                  "Siapa saja yang ikut?"
                )
              ),

              React.createElement(
                "span",
                {
                  className:
                    "count-pill"
                },
                participants.length
              )
            ),

            React.createElement(
              "div",
              {
                className:
                  "add-person"
              },

              React.createElement(
                "input",
                {
                  value:
                    newName,
                  placeholder:
                    "Nama peserta...",
                  onChange: e =>
                    setNewName(
                      e.target.value
                    ),
                  onKeyDown: e => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      addPerson();
                    }
                  }
                }
              ),

              React.createElement(
                "button",
                {
                  className:
                    "primary-button",
                  onClick:
                    addPerson
                },
                "+"
              )
            ),

            React.createElement(
              "div",
              {
                className:
                  "participant-actions"
              },

              React.createElement(
                "button",
                {
                  className:
                    "text-button",
                  onClick:
                    resetParticipants
                },
                "↻ Reset awal"
              )
            ),

            React.createElement(
              "div",
              {
                className:
                  "participant-list"
              },

              participants.map(
                (
                  person,
                  index
                ) =>
                  React.createElement(
                    "div",
                    {
                      className:
                        "participant-row",
                      key:
                        person.id
                    },

                    React.createElement(
                      "span",
                      {
                        className:
                          "participant-index"
                      },
                      String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )
                    ),

                    React.createElement(
                      "span",
                      {
                        className:
                          "participant-name"
                      },
                      person.name
                    ),

                    React.createElement(
                      "button",
                      {
                        className:
                          "icon-button danger",
                        onClick: () =>
                          removePerson(
                            person.id
                          )
                      },
                      "×"
                    )
                  )
              )
            )
          )
        ),


        /* MAIN */

        React.createElement(
          "main",
          {
            className:
              "main-content"
          },

          activeTool
        )
      ),


      /* FOOTER */

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
          "LOKAL SAJA / TANPA LOGIN"
        )
      )
    ),


    /* TOAST */

    notice &&
      React.createElement(
        "div",
        {
          className:
            "toast-notice"
        },
        notice
      )
  );
}


/* ================================
   START APP
================================ */

const root =
  document.getElementById(
    "root"
  );

if (!root) {

  document.body.innerHTML = `
    <div style="
      padding:40px;
      font-family:sans-serif;
      color:#4b334d;
    ">
      <h2>ArunikaMix tidak menemukan #root.</h2>
      <p>
        Pastikan index.html memiliki:
      </p>
      <pre>&lt;div id="root"&gt;&lt;/div&gt;</pre>
    </div>
  `;

} else {

  const app =
    ReactDOM.createRoot(
      root
    );

  app.render(
    React.createElement(
      App
    )
  );

         }
