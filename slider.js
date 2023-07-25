document.addEventListener("DOMContentLoaded", function () {
    function handleSlideChange() {
        const chartDrawer = new ChartDrawer();
        chartDrawer.drawTable();
        chartDrawer.drawHourlyChart();
        chartDrawer.drawDailyChart();
        chartDrawer.drawMonthlyChart();
        chartDrawer.drawSeasonalChart();
        resizeFunc();
    }

    handleSlideChange();
});

class ChartDrawer {
    constructor() {
        this.link =
            "https://raw.githubusercontent.com/Data212db/web-data/main/output.json";
        this.dataPromise = null;
        this.windowWidth = window.innerWidth;
    }

    async drawTable() {
        const data = await this.fetchData();
        const date = new Date();
        const currentDateYear = date.getFullYear();
        const currentDateMonth = date.getMonth() + 1;
        const currentDateDay = date.getDay();
        const tariffInput = document.getElementById("tariff");
        const emissionInput = document.getElementById("emission");

        const firstWeekDay = new Date(date);
        firstWeekDay.setDate(date.getDate() - currentDateDay);

        const lastWeekDay = new Date(firstWeekDay);
        lastWeekDay.setDate(firstWeekDay.getDate() + 6);

        const filteredWeekData = data.filter((entry) => {
            const weekData = new Date(entry.datetime);
            return weekData >= firstWeekDay && weekData <= lastWeekDay;
        });

        const filteredTodayData = data.filter((entry) => {
            const todayDate = new Date(entry.datetime);
            return todayDate.toDateString() === date.toDateString();
        });

        const energyTotal = Math.ceil(
            data.reduce((accum, obj) => accum + Number(obj.generation_value), 0)
        );

        const energyCurrentMonth = Math.ceil(
            data.reduce((accum, obj) => {
                const date = new Date(obj.date);
                const dateYear = date.getFullYear();
                const dateMonth = date.getMonth() + 1;

                if (
                    dateYear === currentDateYear &&
                    dateMonth === currentDateMonth
                ) {
                    return accum + Number(obj.generation_value);
                } else {
                    return accum;
                }
            }, 0)
        );

        const energyCurrentWeek = Math.ceil(
            filteredWeekData.reduce(
                (accum, obj) => accum + Number(obj.generation_value),
                0
            )
        );

        const energyCurrentDay = Math.ceil(
            filteredTodayData.reduce(
                (accum, obj) => accum + Number(obj.generation_value),
                0
            )
        );

        document.querySelector(
            '[data-column="1"][data-row="1"]'
        ).innerHTML = `${energyTotal.toLocaleString("en-US")} kWh`;

        document.querySelector(
            '[data-column="2"][data-row="1"]'
        ).innerHTML = `${energyCurrentMonth.toLocaleString("en-US")} kWh`;

        document.querySelector(
            '[data-column="3"][data-row="1"]'
        ).innerHTML = `${energyCurrentWeek.toLocaleString("en-US")} kWh`;

        document.querySelector(
            '[data-column="4"][data-row="1"]'
        ).innerHTML = `${energyCurrentDay.toLocaleString("en-US")} kWh`;

        function updateSavings() {
            const savingTotal = Math.ceil(
                energyTotal * tariffInput.value
            ).toLocaleString("en-US");

            const savingCurrentMonth = Math.ceil(
                energyCurrentMonth * tariffInput.value
            ).toLocaleString("en-US");

            const savingCurrentWeek = Math.ceil(
                energyCurrentWeek * tariffInput.value
            ).toLocaleString("en-US");

            const savingCurrentDay = Math.ceil(
                energyCurrentDay * tariffInput.value
            ).toLocaleString("en-US");

            document.querySelector(
                '[data-column="1"][data-row="2"]'
            ).innerHTML = `$${savingTotal}`;

            document.querySelector(
                '[data-column="2"][data-row="2"]'
            ).innerHTML = `$${savingCurrentMonth}`;

            document.querySelector(
                '[data-column="3"][data-row="2"]'
            ).innerHTML = `$${savingCurrentWeek}`;

            document.querySelector(
                '[data-column="4"][data-row="2"]'
            ).innerHTML = `$${savingCurrentDay}`;
        }

        function updateEmission() {
            const emissionTotal = Math.ceil(
                (energyTotal * emissionInput.value) / 1000
            ).toLocaleString("en-US");

            const emissionCurrentMonth = Math.ceil(
                (energyCurrentMonth * emissionInput.value) / 1000
            ).toLocaleString("en-US");

            const emissionCurrentWeek = Math.ceil(
                (energyCurrentWeek * emissionInput.value) / 1000
            ).toLocaleString("en-US");

            const emissionCurrentDay = Math.ceil(
                (energyCurrentDay * emissionInput.value) / 1000
            ).toLocaleString("en-US");

            document.querySelector(
                '[data-column="1"][data-row="3"]'
            ).innerHTML = `${emissionTotal} tCO2`;

            document.querySelector(
                '[data-column="2"][data-row="3"]'
            ).innerHTML = `${emissionCurrentMonth} tCO2`;

            document.querySelector(
                '[data-column="3"][data-row="3"]'
            ).innerHTML = `${emissionCurrentWeek} tCO2`;

            document.querySelector(
                '[data-column="4"][data-row="3"]'
            ).innerHTML = `${emissionCurrentDay} tCO2`;
        }

        updateSavings();
        updateEmission();
        tariffInput.addEventListener("input", updateSavings);
        emissionInput.addEventListener("input", updateEmission);
    }

    fetchData() {
        if (!this.dataPromise) {
            this.dataPromise = fetch(this.link)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(response.status);
                    }
                    return response.json();
                })
                .catch((error) => {
                    this.dataPromise = null;
                    throw error;
                });
        }
        return this.dataPromise;
    }

    async drawHourlyChart() {
        const data = await this.fetchData();
        const hourlyData = this.calculateHourlyData(data);

        const chart = [
            {
                type: "scatter",
                x: Object.keys(hourlyData.winter),
                y: Object.values(hourlyData.winter).map((value) =>
                    value.toString()
                ),
                mode: "lines",
                name: "winter",
                line: {
                    color: "#ddd",
                    width: 2,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
            {
                type: "scatter",
                x: Object.keys(hourlyData.spring),
                y: Object.values(hourlyData.spring).map((value) =>
                    value.toString()
                ),
                mode: "lines",
                name: "spring",
                line: {
                    color: "#0ce5cc",
                    width: 2,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
            {
                type: "scatter",
                x: Object.keys(hourlyData.summer),
                y: Object.values(hourlyData.summer).map((value) =>
                    value.toString()
                ),
                mode: "lines",
                name: "summer",
                line: {
                    color: "#ca3b5a",
                    width: 2,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
            {
                type: "scatter",
                x: Object.keys(hourlyData.autumn),
                y: Object.values(hourlyData.autumn).map((value) =>
                    value.toString()
                ),
                mode: "lines",
                name: "autumn",
                line: {
                    color: "#d3b246",
                    width: 2,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
        ];

        const layout = {
            colorway: ["#FFC327"],
            margin: {
                b: 60,
                t: 60,
                r: 20,
                l: 50,
            },
            showlegend: false,
            font: {
                color: "#ddd",
                size: 14,
            },
            title: {
                text: "Average Hourly Production",
                x: 0.05,
                font: {
                    color: "#ddd",
                    size: "18",
                },
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",

            xaxis: {
                ticklabelstep: this.windowWidth >= 1600 ? 1 : 2,
                tickangle: -45,
                fixedrange: true,
                tickwidth: 1,
                titlefont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                gridcolor: "#3a3a3a",
            },
            yaxis: {
                fixedrange: true,
                tickwidth: 1,
                // title: {
                //     text: "kWh",
                //     standoff: 2,
                //     font: {
                //         size: 12,
                //     },
                // },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                },
                gridcolor: "#3a3a3a",
            },
        };

        Plotly.newPlot("hourlyFrame", chart, layout, {
            responsive: true,
            displayModeBar: false,
        });
    }

    async drawDailyChart() {
        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 20);

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
        const currentDateStr = formatDate(currentDate);
        const startDateStr = formatDate(startDate);

        const data = await this.fetchData();
        const dailyData = this.calculateDailyData(data);

        const chart = [
            {
                x: Object.keys(dailyData),
                y: Object.values(dailyData).map((value) => value.toString()),
                type: "bar",
                marker: {
                    autocolorscale: true,
                    color: "#d3b246",
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
                // visible: "legendonly",
            },
        ];

        const layout = {
            modebar: {
                bgcolor: "transparent",
                remove: [
                    "autoScale2d",
                    "autoscale",
                    "editInChartStudio",
                    "editinchartstudio",
                    "hoverCompareCartesian",
                    "hovercompare",
                    "lasso",
                    "lasso2d",
                    "orbitRotation",
                    "orbitrotation",
                    "reset",
                    "resetCameraDefault3d",
                    "resetCameraLastSave3d",
                    "resetGeo",
                    "resetSankeyGroup",
                    "resetViewMapbox",
                    "resetViews",
                    "resetcameradefault",
                    "resetcameralastsave",
                    "resetsankeygroup",
                    "resetview",
                    "resetviews",
                    "select",
                    "select2d",
                    "sendDataToCloud",
                    "senddatatocloud",
                    "tableRotation",
                    "tablerotation",
                    "toImage",
                    "toggleHover",
                    "toggleSpikelines",
                    "togglehover",
                    "togglespikelines",
                    "toimage",
                    "zoomInGeo",
                    "zoomInMapbox",
                    "zoomOutGeo",
                    "zoomOutMapbox",
                ],
            },
            dragmode: "pan",
            colorway: ["#FFC327"],
            margin: {
                b: 60,
                t: 100,
                r: 20,
                l: 50,
            },
            showlegend: false,
            font: {
                color: "#ddd",
                size: 14,
            },
            title: {
                text: "Daily energy production",
                x: 0.05,
                font: {
                    color: "#ddd",
                    size: "18",
                },
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",

            xaxis: {
                tickwidth: 1,
                titlefont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                range:
                    this.windowWidth >= 960
                        ? ["2022-04-19", new Date()]
                        : [startDateStr, currentDateStr],
                gridcolor: "#3a3a3a",
            },
            yaxis: {
                tickwidth: 1,
                fixedrange: true,
                // title: {
                //     text: "kWh",
                //     standoff: 10,
                //     font: {
                //         size: 14,
                //     },
                // },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                },
                gridcolor: "#3a3a3a",
            },
        };

        Plotly.newPlot("dailyFrame", chart, layout, {
            scrollZoom: true,
            responsive: true,
            displayModeBar: true,
        });
    }

    async drawMonthlyChart() {
        const data = await this.fetchData();
        const monthlyData = this.calculateMonthlyData(data);

        const chart = [
            {
                x: Object.keys(monthlyData),
                y: Object.values(monthlyData).map((value) =>
                    Math.ceil(value).toString()
                ),
                type: "bar",
                marker: {
                    color: "#d3b246",
                    color: Object.values(monthlyData).map((value) =>
                        value.toString()
                    ),
                    colorscale: [
                        [0, "#F1F1F1"],
                        [1, "#FFC327"],
                    ],
                    showscale: false,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
        ];

        const layout = {
            colorway: ["#FFC327"],
            margin: {
                b: 70,
                t: 60,
                r: 20,
                l: 50,
            },
            showlegend: false,
            font: {
                color: "#ddd",
                size: 14,
            },
            title: {
                text: "Monthly energy production",
                x: 0.05,
                font: {
                    color: "#ddd",
                    size: "18",
                },
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",

            xaxis: {
                ticklabelstep: this.windowWidth >= 960 ? 1 : 2,
                tickangle: -45,
                fixedrange: true,
                tickwidth: 1,
                titlefont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                gridcolor: "#3a3a3a",
            },
            yaxis: {
                tickwidth: 1,
                fixedrange: true,
                // title: {
                //     text: "kWh",
                //     standoff: 10,
                //     font: {
                //         size: 14,
                //     },
                // },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                },
                gridcolor: "#3a3a3a",
            },
        };

        Plotly.newPlot("monthlyFrame", chart, layout, {
            responsive: true,
            displayModeBar: false,
        });
    }

    async drawSeasonalChart() {
        const data = await this.fetchData();
        const seasonalData = this.calculateSeasonalData(data);

        const chart = [
            {
                x: Object.keys(seasonalData),
                y: Object.values(seasonalData).map((value) => value.toString()),
                type: "bar",
                marker: {
                    color: "#d3b246",
                    color: Object.values(seasonalData).map((value) =>
                        value.toString()
                    ),
                    colorscale: [
                        [0, "#F1F1F1"],
                        [1, "#FFC327"],
                    ],
                    showscale: false,
                },
                hoverlabel: {
                    bgcolor: "#000",
                    bordercolor: "000",
                    font: {
                        color: "#ddd",
                        size: 14,
                    },
                },
                hovertemplate: "%{x}</br></br>%{y:.0f} kWh<extra></extra>",
                xhoverformat: "%d %b",
            },
        ];

        const layout = {
            colorway: ["#FFC327"],
            margin: {
                b: 70,
                t: 60,
                r: 20,
                l: 50,
            },
            showlegend: false,
            font: {
                color: "#ddd",
                size: 14,
            },
            title: {
                text: "Seasonal energy production",
                x: 0.05,
                font: {
                    color: "#ddd",
                    size: "18",
                    weight: "700",
                },
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",

            xaxis: {
                tickwidth: 1,
                tickangle: -45,
                fixedrange: true,
                titlefont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                    weight: "bold",
                },
                gridcolor: "#3a3a3a",
            },
            yaxis: {
                tickwidth: 1,
                fixedrange: true,
                // title: {
                //     text: "kWh",
                //     standoff: 10,
                //     font: {
                //         size: 14,
                //     },
                // },
                tickfont: {
                    color: "white",
                    size: 12,
                    family: "Arial",
                },
                gridcolor: "#3a3a3a",
            },
        };

        Plotly.newPlot("seasonalFrame", chart, layout, {
            responsive: true,
            displayModeBar: false,
        });
    }

    calculateHourlyData(data) {
        const hourlyData = {};

        data.forEach((value) => {
            const datetime = new Date(value.datetime);
            const season = value.season;
            const hour = datetime.getHours().toString() + ":00";

            if (!hourlyData[season]) {
                hourlyData[season] = {};
            }
            if (!hourlyData[season][hour]) {
                hourlyData[season][hour] = [];
            }

            hourlyData[season][hour].push(parseFloat(value.generation_value));
        });

        Object.keys(hourlyData).forEach((season) => {
            Object.keys(hourlyData[season]).forEach((hour) => {
                const values = hourlyData[season][hour];
                const averageValue =
                    values.reduce((sum, value) => sum + value, 0) /
                    values.length;
                hourlyData[season][hour] = averageValue;
            });
        });

        return hourlyData;
    }

    calculateDailyData(data) {
        const dailyData = {};

        data.forEach((value) => {
            const date = value.date;
            const generation_value = parseFloat(value.generation_value);
            if (dailyData[date]) {
                dailyData[date] += generation_value;
            } else {
                dailyData[date] = generation_value;
            }
        });

        return dailyData;
    }

    calculateMonthlyData(data) {
        const monthlyData = {};

        data.forEach((value) => {
            const date = new Date(value.date);
            const year = date.getFullYear();
            const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            const month = monthNames[date.getMonth()];

            const key = month + " " + year;
            const generation_value = parseFloat(value.generation_value);

            if (monthlyData[key]) {
                monthlyData[key] += generation_value;
            } else {
                monthlyData[key] = generation_value;
            }
        });

        return monthlyData;
    }

    calculateSeasonalData(data) {
        const seasonalData = {};

        data.forEach((value) => {
            const season = value.season;
            const generation_value = parseFloat(value.generation_value);
            const date = new Date(value.date);
            const year = date.getFullYear();

            let abbrSeason;

            switch (season) {
                case "winter":
                    abbrSeason = "Win";
                    break;
                case "spring":
                    abbrSeason = "Spg";
                    break;
                case "summer":
                    abbrSeason = "Sum";
                    break;
                case "autumn":
                    abbrSeason = "Fall";
                    break;
                default:
                    abbrSeason = "none";
            }

            const key = abbrSeason + " " + year;
            if (seasonalData[key]) {
                seasonalData[key] += generation_value;
            } else {
                seasonalData[key] = generation_value;
            }
        });

        return seasonalData;
    }
}

function resizeFunc() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    function showTabContent(tabId) {
        tabContents.forEach((content) => {
            content.classList.add("hidden");
        });
        document.getElementById(tabId).classList.remove("hidden");
    }

    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            showTabContent(tabId);

            tabButtons.forEach((btn) => {
                btn.classList.remove("active");
            });
            this.classList.add("active");
        });
    });

    showTabContent("seasonalFrame");

    function handleResize() {
        const windowWidth = window.innerWidth;
        if (windowWidth >= 1200) {
            tabContents.forEach((content) => {
                content.classList.remove("hidden");
            });
            document.querySelector(".tabs").style.display = "none";
        } else {
            tabContents.forEach((content) => {
                content.classList.add("hidden");
            });
            document.querySelector(".tabs").style.display = "grid";
            const activeTab = document.querySelector(".tab-button.active");
            if (activeTab) {
                const activeTabId = activeTab.getAttribute("data-tab");
                document.getElementById(activeTabId).classList.remove("hidden");
            }
        }
    }

    handleResize();

    window.addEventListener("resize", handleResize);
}
