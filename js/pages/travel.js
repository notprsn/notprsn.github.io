const onReady = window.Site?.onReady ?? ((callback) => callback());

const MAP_DIMENSIONS = {
    width: 1160,
    height: 620,
};

const TIMELINE_MIN_WIDTH = 980;
const TIMELINE_LANE_GAP = 52;
const TIMELINE_PILL_HEIGHT = 28;

const INDIA_PIN_COLORS = {
    city: "#c85d38",
    state: "#1f7a45",
};

const TRAVEL_ROUTE_BASE = "/essays/travel/";

const INDIA_FILL = createFlagFill("vertical", [
    [0, "#ff9933"],
    [0.34, "#ff9933"],
    [0.34, "#fff8ed"],
    [0.66, "#fff8ed"],
    [0.66, "#128807"],
    [1, "#128807"],
]);

const MAP_OCHRE_FILLS = {
    india: createFlagFill("diagonal", [
        [0, "#ba8447"],
        [1, "#7a4a23"],
    ]),
    brunei: createFlagFill("vertical", [
        [0, "#d1a062"],
        [1, "#855329"],
    ]),
    singapore: createFlagFill("vertical", [
        [0, "#c38949"],
        [1, "#6c4020"],
    ]),
    malaysia: createFlagFill("horizontal", [
        [0, "#bf8a46"],
        [1, "#734521"],
    ]),
    thailand: createFlagFill("diagonal", [
        [0, "#d2a25d"],
        [1, "#7a4d28"],
    ]),
    canada: createFlagFill("vertical", [
        [0, "#c98745"],
        [1, "#76461f"],
    ]),
    jordan: createFlagFill("horizontal", [
        [0, "#b7793b"],
        [1, "#68401f"],
    ]),
    "sri-lanka": createFlagFill("vertical", [
        [0, "#ce9551"],
        [1, "#7d4a25"],
    ]),
    indonesia: createFlagFill("diagonal", [
        [0, "#c88a46"],
        [1, "#6f4320"],
    ]),
    netherlands: createFlagFill("vertical", [
        [0, "#c69051"],
        [1, "#734522"],
    ]),
    belgium: createFlagFill("horizontal", [
        [0, "#b98141"],
        [1, "#6a3f1e"],
    ]),
    vietnam: createFlagFill("diagonal", [
        [0, "#d2a460"],
        [1, "#7c4c24"],
    ]),
    "united-arab-emirates": createFlagFill("vertical", [
        [0, "#c18643"],
        [1, "#714321"],
    ]),
    "united-kingdom": createFlagFill("horizontal", [
        [0, "#cd9553"],
        [1, "#7a4822"],
    ]),
};

const COUNTRY_FEATURE_IDS = {
    india: ["356"],
    brunei: ["96"],
    singapore: ["702"],
    malaysia: ["458"],
    thailand: ["764"],
    canada: ["124"],
    jordan: ["400"],
    "sri-lanka": ["144"],
    indonesia: ["360"],
    netherlands: ["528"],
    belgium: ["56"],
    vietnam: ["704"],
    "united-arab-emirates": ["784"],
    "united-kingdom": ["826"],
};

const TIMELINE_FLAG_FILLS = {
    brunei: createFlagFill("diagonal", [
        [0, "#f6d648"],
        [0.42, "#f6d648"],
        [0.42, "#ffffff"],
        [0.47, "#ffffff"],
        [0.47, "#111111"],
        [0.57, "#111111"],
        [0.57, "#ffffff"],
        [0.62, "#ffffff"],
        [0.62, "#f6d648"],
        [1, "#f6d648"],
    ]),
    singapore: createFlagFill("vertical", [
        [0, "#df1f26"],
        [0.5, "#df1f26"],
        [0.5, "#ffffff"],
        [1, "#ffffff"],
    ]),
    malaysia: createFlagFill("vertical", [
        [0, "#c8202f"],
        [0.12, "#c8202f"],
        [0.12, "#ffffff"],
        [0.24, "#ffffff"],
        [0.24, "#c8202f"],
        [0.36, "#c8202f"],
        [0.36, "#ffffff"],
        [0.48, "#ffffff"],
        [0.48, "#0b3f8a"],
        [0.76, "#0b3f8a"],
        [0.76, "#f1c845"],
        [1, "#f1c845"],
    ]),
    thailand: createFlagFill("vertical", [
        [0, "#b11d2f"],
        [0.2, "#b11d2f"],
        [0.2, "#ffffff"],
        [0.35, "#ffffff"],
        [0.35, "#1b2f7c"],
        [0.65, "#1b2f7c"],
        [0.65, "#ffffff"],
        [0.8, "#ffffff"],
        [0.8, "#b11d2f"],
        [1, "#b11d2f"],
    ]),
    canada: createFlagFill("horizontal", [
        [0, "#d3202d"],
        [0.25, "#d3202d"],
        [0.25, "#ffffff"],
        [0.75, "#ffffff"],
        [0.75, "#d3202d"],
        [1, "#d3202d"],
    ]),
    jordan: createFlagFill("horizontal", [
        [0, "#c01d25"],
        [0.18, "#c01d25"],
        [0.18, "#111111"],
        [0.46, "#111111"],
        [0.46, "#ffffff"],
        [0.72, "#ffffff"],
        [0.72, "#1d8a43"],
        [1, "#1d8a43"],
    ]),
    "sri-lanka": createFlagFill("horizontal", [
        [0, "#f09a28"],
        [0.16, "#f09a28"],
        [0.16, "#0f7a3b"],
        [0.28, "#0f7a3b"],
        [0.28, "#f7bf3d"],
        [0.4, "#f7bf3d"],
        [0.4, "#6f1527"],
        [1, "#6f1527"],
    ]),
    indonesia: createFlagFill("vertical", [
        [0, "#d21f26"],
        [0.5, "#d21f26"],
        [0.5, "#ffffff"],
        [1, "#ffffff"],
    ]),
    netherlands: createFlagFill("vertical", [
        [0, "#ae1f28"],
        [0.33, "#ae1f28"],
        [0.33, "#ffffff"],
        [0.66, "#ffffff"],
        [0.66, "#1f4f9c"],
        [1, "#1f4f9c"],
    ]),
    belgium: createFlagFill("horizontal", [
        [0, "#121212"],
        [0.33, "#121212"],
        [0.33, "#f0c533"],
        [0.66, "#f0c533"],
        [0.66, "#c62832"],
        [1, "#c62832"],
    ]),
    vietnam: createFlagFill("diagonal", [
        [0, "#c92026"],
        [0.78, "#c92026"],
        [0.78, "#f2c53d"],
        [1, "#f2c53d"],
    ]),
    "united-arab-emirates": createFlagFill("horizontal", [
        [0, "#d91f26"],
        [0.18, "#d91f26"],
        [0.18, "#1f8b4c"],
        [0.46, "#1f8b4c"],
        [0.46, "#ffffff"],
        [0.72, "#ffffff"],
        [0.72, "#111111"],
        [1, "#111111"],
    ]),
    "united-kingdom": createFlagFill("diagonal", [
        [0, "#1f3f91"],
        [0.28, "#1f3f91"],
        [0.28, "#ffffff"],
        [0.4, "#ffffff"],
        [0.4, "#c91f26"],
        [0.58, "#c91f26"],
        [0.58, "#ffffff"],
        [0.7, "#ffffff"],
        [0.7, "#1f3f91"],
        [1, "#1f3f91"],
    ]),
};

const TRAVEL_COUNTRY_DATA = [
    { slug: "india", name: "India", interactionMode: "india-focus" },
    { slug: "brunei", name: "Brunei", startYear: 2006, endYear: 2009 },
    {
        slug: "singapore",
        name: "Singapore",
        startYear: 2006,
        endYear: 2009,
        specialMarker: { coordinates: [103.8198, 1.3521], radius: 5.6 },
    },
    { slug: "malaysia", name: "Malaysia", startYear: 2006, endYear: 2009 },
    { slug: "thailand", name: "Thailand", startYear: 2006, endYear: 2009 },
    { slug: "canada", name: "Canada", startYear: 2013, endYear: 2013 },
    { slug: "jordan", name: "Jordan", startYear: 2015, endYear: 2015 },
    { slug: "sri-lanka", name: "Sri Lanka", startYear: 2017, endYear: 2017 },
    { slug: "indonesia", name: "Indonesia", startYear: 2019, endYear: 2019 },
    { slug: "netherlands", name: "Netherlands", startYear: 2023, endYear: 2023 },
    { slug: "belgium", name: "Belgium", startYear: 2023, endYear: 2023 },
    { slug: "vietnam", name: "Vietnam", startYear: 2024, endYear: 2024 },
    { slug: "united-arab-emirates", name: "United Arab Emirates", displayLabel: "UAE", startYear: 2024, endYear: 2024 },
    { slug: "united-kingdom", name: "United Kingdom", displayLabel: "UK", startYear: 2025, endYear: 2025 },
];

const TRAVEL_COUNTRIES = TRAVEL_COUNTRY_DATA.map((country) => {
    const endYear = country.endYear ?? country.startYear;
    return {
        interactionMode: "country-link",
        ...country,
        endYear,
        route: buildTravelRoute(country.slug),
        displayLabel: country.displayLabel ?? country.name.toUpperCase(),
        hoverLabel: buildTravelHoverLabel(country.name, country.startYear, endYear),
        mapFill: MAP_OCHRE_FILLS[country.slug] ?? INDIA_FILL,
        timelineFill: TIMELINE_FLAG_FILLS[country.slug] ?? null,
    };
});

const INDIA_PLACES = [
    { slug: "mumbai", name: "Mumbai", kind: "city", coordinates: [72.8777, 19.076], offset: [-10, 8] },
    { slug: "new-delhi", name: "New Delhi", kind: "city", coordinates: [77.209, 28.6139], offset: [10, -16] },
    { slug: "gurgaon", name: "Gurgaon", kind: "city", coordinates: [77.0266, 28.4595], offset: [21, 10] },
    { slug: "jaipur", name: "Jaipur", kind: "city", coordinates: [75.7873, 26.9124], offset: [-18, -4] },
    { slug: "agra", name: "Agra", kind: "city", coordinates: [78.0081, 27.1767], offset: [26, -2] },
    { slug: "goa", name: "Goa", kind: "state", coordinates: [74.124, 15.2993], offset: [-12, 14] },
    { slug: "sikkim", name: "Sikkim", kind: "state", coordinates: [88.5122, 27.533], offset: [12, -10] },
    { slug: "himachal-pradesh", name: "Himachal Pradesh", kind: "state", coordinates: [77.1734, 31.1048], offset: [-22, -14] },
    { slug: "kerala", name: "Kerala", kind: "state", coordinates: [76.2711, 10.8505], offset: [15, 10] },
    { slug: "uttarakhand", name: "Uttarakhand", kind: "state", coordinates: [79.0193, 30.0668], offset: [20, -15] },
    { slug: "tiruchirapalli", name: "Tiruchirapalli", kind: "city", coordinates: [78.7047, 10.7905], offset: [-10, 10] },
    { slug: "bengaluru", name: "Bengaluru", kind: "city", coordinates: [77.5946, 12.9716], offset: [16, -4] },
    { slug: "mysuru", name: "Mysuru", kind: "city", coordinates: [76.6394, 12.2958], offset: [-18, 8] },
    { slug: "andaman-and-nicobar", name: "Andaman and Nicobar", kind: "state", coordinates: [92.9376, 11.7401], offset: [14, -6] },
].map((place) => ({
    ...place,
    route: buildTravelRoute(place.slug),
}));

const countryByName = new Map(TRAVEL_COUNTRIES.map((country) => [country.name, country]));
const countryByFeatureId = new Map(
    TRAVEL_COUNTRIES.flatMap((country) =>
        (COUNTRY_FEATURE_IDS[country.slug] ?? []).map((featureId) => [normalizeCountryKey(featureId), country])
    )
);
const worldMarkers = TRAVEL_COUNTRIES.filter((country) => country.specialMarker);

onReady(() => {
    initTravelPage().catch((error) => {
        console.error(error);
    });
});

async function initTravelPage() {
    const root = document.querySelector("[data-travel-page]");
    if (!root) {
        return;
    }

    const mapStageNode = root.querySelector("[data-travel-map-stage]");
    const mapNode = root.querySelector("[data-travel-map]");
    const pillNode = root.querySelector("[data-travel-pill]");
    const resetButton = root.querySelector("[data-map-reset]");
    const backButton = root.querySelector("[data-map-back]");
    const timelineNode = root.querySelector("[data-travel-timeline]");

    if (
        !(mapStageNode instanceof HTMLElement) ||
        !(pillNode instanceof HTMLElement) ||
        !(mapNode instanceof SVGElement) ||
        !(timelineNode instanceof SVGElement) ||
        !(resetButton instanceof HTMLButtonElement) ||
        !(backButton instanceof HTMLButtonElement)
    ) {
        return;
    }

    const [d3, topojson, worldData] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
        import("https://cdn.jsdelivr.net/npm/topojson-client@3/+esm"),
        fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json", { cache: "force-cache" }).then((response) => {
            if (!response.ok) {
                throw new Error("Could not load world map data.");
            }
            return response.json();
        }),
    ]);

    initTravelMap({
        d3,
        topojson,
        worldData,
        mapStageNode,
        mapNode,
        pillNode,
        resetButton,
        backButton,
    });
    initTravelTimeline({ d3, timelineNode });
}

function initTravelMap({ d3, topojson, worldData, mapStageNode, mapNode, pillNode, resetButton, backButton }) {
    const projection = d3.geoNaturalEarth1().fitExtent(
        [
            [36, 34],
            [MAP_DIMENSIONS.width - 36, MAP_DIMENSIONS.height - 36],
        ],
        { type: "Sphere" }
    );
    const path = d3.geoPath(projection);
    const countries = topojson.feature(worldData, worldData.objects.countries).features;
    const graticule = d3.geoGraticule10();
    const indiaFeature = countries.find((feature) => getCountryForFeature(feature)?.slug === "india");

    const state = {
        viewMode: "world",
        activeCountrySlug: "",
        activeIndiaPlaceSlug: "",
        activeMarkerSlug: "",
    };

    const svg = d3.select(mapNode).attr("viewBox", `0 0 ${MAP_DIMENSIONS.width} ${MAP_DIMENSIONS.height}`);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    createGradientDefs(defs, TRAVEL_COUNTRIES, "mapFill", "map");

    const scene = svg.append("g").attr("class", "travel-map__scene");
    scene.append("path").datum({ type: "Sphere" }).attr("class", "travel-map__sphere").attr("d", path);
    scene.append("path").datum(graticule).attr("class", "travel-map__graticule").attr("d", path);

    const countriesLayer = scene.append("g").attr("class", "travel-map__countries");
    const worldMarkersLayer = scene.append("g").attr("class", "travel-map__world-markers");
    const indiaPinsLayer = scene.append("g").attr("class", "travel-map__india-pins");

    const countrySelection = countriesLayer
        .selectAll("path")
        .data(countries)
        .join("path")
        .attr("class", (feature) => buildCountryClassNames(getCountryForFeature(feature)))
        .attr("d", path)
        .attr("fill", (feature) => {
            const country = getCountryForFeature(feature);
            return country?.mapFill ? `url(#map-${country.slug})` : "transparent";
        })
        .attr("tabindex", -1)
        .on("pointerenter", (_, feature) => {
            if (state.viewMode !== "world") {
                return;
            }

            const country = getCountryForFeature(feature);
            if (!country) {
                clearWorldHover();
                return;
            }

            state.activeCountrySlug = country.slug;
            state.activeMarkerSlug = country.specialMarker ? country.slug : "";
            syncMapState();
            showPill(pillNode, country.hoverLabel);
        })
        .on("pointerleave", () => {
            if (state.viewMode !== "world") {
                return;
            }

            clearWorldHover();
        })
        .on("focus", (_, feature) => {
            if (state.viewMode !== "world") {
                return;
            }

            const country = getCountryForFeature(feature);
            if (!country) {
                clearWorldHover();
                return;
            }

            state.activeCountrySlug = country.slug;
            state.activeMarkerSlug = country.specialMarker ? country.slug : "";
            syncMapState();
            showPill(pillNode, country.hoverLabel);
        })
        .on("blur", () => {
            if (state.viewMode !== "world") {
                return;
            }

            clearWorldHover();
        })
        .on("click", (event, feature) => {
            if (state.viewMode !== "world") {
                return;
            }

            const country = getCountryForFeature(feature);
            if (!country) {
                return;
            }

            if (country.interactionMode === "india-focus") {
                event.currentTarget?.blur?.();
                enterIndiaMode();
                return;
            }

            event.currentTarget?.blur?.();
            window.location.href = country.route;
        })
        .on("keydown", (event, feature) => {
            if (state.viewMode !== "world" || (event.key !== "Enter" && event.key !== " ")) {
                return;
            }

            event.preventDefault();
            const country = getCountryForFeature(feature);
            if (!country) {
                return;
            }

            if (country.interactionMode === "india-focus") {
                enterIndiaMode();
                return;
            }

            window.location.href = country.route;
        });

    const markerSelection = worldMarkersLayer
        .selectAll("g")
        .data(worldMarkers)
        .join("g")
        .attr("class", "travel-map__marker-group")
        .attr("transform", (country) => {
            const [x, y] = projection(country.specialMarker.coordinates);
            return `translate(${x}, ${y})`;
        })
        .attr("tabindex", -1)
        .attr("role", "link")
        .attr("aria-label", (country) => `Open ${country.name}`)
        .on("pointerenter", (_, country) => {
            if (state.viewMode !== "world") {
                return;
            }

            state.activeCountrySlug = country.slug;
            state.activeMarkerSlug = country.slug;
            syncMapState();
            showPill(pillNode, country.hoverLabel);
        })
        .on("pointerleave", () => {
            if (state.viewMode !== "world") {
                return;
            }

            clearWorldHover();
        })
        .on("focus", (_, country) => {
            if (state.viewMode !== "world") {
                return;
            }

            state.activeCountrySlug = country.slug;
            state.activeMarkerSlug = country.slug;
            syncMapState();
            showPill(pillNode, country.hoverLabel);
        })
        .on("blur", () => {
            if (state.viewMode !== "world") {
                return;
            }

            clearWorldHover();
        })
        .on("click", (event, country) => {
            if (state.viewMode !== "world") {
                return;
            }

            event.currentTarget?.blur?.();
            window.location.href = country.route;
        })
        .on("keydown", (event, country) => {
            if (state.viewMode !== "world" || (event.key !== "Enter" && event.key !== " ")) {
                return;
            }

            event.preventDefault();
            window.location.href = country.route;
        });

    markerSelection
        .append("line")
        .attr("class", "travel-map__marker-stem")
        .attr("x1", 0)
        .attr("y1", 5)
        .attr("x2", 0)
        .attr("y2", 18);

    markerSelection
        .append("circle")
        .attr("class", "travel-map__marker-core")
        .attr("r", (country) => country.specialMarker.radius)
        .attr("cy", 0)
        .attr("fill", (country) => `url(#map-${country.slug})`);

    const indiaPinSelection = indiaPinsLayer
        .selectAll("g")
        .data(INDIA_PLACES)
        .join("g")
        .attr("class", "travel-map__india-pin-group")
        .attr("transform", (place) => {
            const [x, y] = projection(place.coordinates);
            const offsetX = place.offset?.[0] ?? 0;
            const offsetY = place.offset?.[1] ?? 0;
            return `translate(${x + offsetX}, ${y + offsetY})`;
        })
        .attr("tabindex", -1)
        .attr("role", "link")
        .attr("aria-label", (place) => `Open ${place.name}`)
        .on("pointerenter", (_, place) => {
            if (state.viewMode !== "india") {
                return;
            }

            state.activeIndiaPlaceSlug = place.slug;
            syncMapState();
            showPill(pillNode, place.name);
        })
        .on("pointerleave", () => {
            if (state.viewMode !== "india") {
                return;
            }

            clearIndiaHover();
        })
        .on("focus", (_, place) => {
            if (state.viewMode !== "india") {
                return;
            }

            state.activeIndiaPlaceSlug = place.slug;
            syncMapState();
            showPill(pillNode, place.name);
        })
        .on("blur", () => {
            if (state.viewMode !== "india") {
                return;
            }

            clearIndiaHover();
        })
        .on("click", (event, place) => {
            if (state.viewMode !== "india") {
                return;
            }

            event.currentTarget?.blur?.();
            window.location.href = place.route;
        })
        .on("keydown", (event, place) => {
            if (state.viewMode !== "india" || (event.key !== "Enter" && event.key !== " ")) {
                return;
            }

            event.preventDefault();
            window.location.href = place.route;
        });

    indiaPinSelection
        .append("line")
        .attr("class", "travel-map__india-pin-line")
        .attr("x1", (place) => -(place.offset?.[0] ?? 0))
        .attr("y1", (place) => -(place.offset?.[1] ?? 0))
        .attr("x2", 0)
        .attr("y2", 0);

    indiaPinSelection
        .append("circle")
        .attr("class", "travel-map__india-pin")
        .attr("r", (place) => (place.kind === "state" ? 5.8 : 4.9))
        .attr("fill", (place) => INDIA_PIN_COLORS[place.kind] ?? INDIA_PIN_COLORS.city);

    const zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent([
            [-MAP_DIMENSIONS.width * 0.45, -MAP_DIMENSIONS.height * 0.45],
            [MAP_DIMENSIONS.width * 1.45, MAP_DIMENSIONS.height * 1.45],
        ])
        .on("zoom", (event) => {
            scene.attr("transform", event.transform);
        });

    svg.call(zoom);

    const indiaTransform = indiaFeature ? computeFeatureTransform(path, indiaFeature, d3) : d3.zoomIdentity;

    resetButton.addEventListener("click", () => {
        if (state.viewMode === "india") {
            applyTransform(indiaTransform);
            return;
        }

        applyTransform(d3.zoomIdentity);
    });

    backButton.addEventListener("click", () => {
        exitIndiaMode();
    });

    function syncMapState() {
        const isIndiaMode = state.viewMode === "india";
        mapStageNode.classList.toggle("is-india-mode", isIndiaMode);
        backButton.hidden = !isIndiaMode;

        countrySelection
            .classed("is-active", (feature) => getCountryForFeature(feature)?.slug === state.activeCountrySlug)
            .classed("is-india-focus", (feature) => isIndiaMode && getCountryForFeature(feature)?.slug === "india")
            .attr("tabindex", (feature) => getCountryTabIndex(getCountryForFeature(feature), state.viewMode));

        markerSelection
            .classed("is-active", (country) => state.activeMarkerSlug === country.slug)
            .attr("tabindex", isIndiaMode ? -1 : 0);

        indiaPinSelection
            .classed("is-active", (place) => state.activeIndiaPlaceSlug === place.slug)
            .attr("tabindex", isIndiaMode ? 0 : -1);
    }

    function clearWorldHover() {
        state.activeCountrySlug = "";
        state.activeMarkerSlug = "";
        syncMapState();
        hidePill(pillNode);
    }

    function clearIndiaHover() {
        state.activeIndiaPlaceSlug = "";
        syncMapState();
        hidePill(pillNode);
    }

    function enterIndiaMode() {
        state.viewMode = "india";
        state.activeCountrySlug = "india";
        state.activeMarkerSlug = "";
        state.activeIndiaPlaceSlug = "";
        syncMapState();
        hidePill(pillNode);
        applyTransform(indiaTransform);
    }

    function exitIndiaMode() {
        state.viewMode = "world";
        state.activeCountrySlug = "";
        state.activeMarkerSlug = "";
        state.activeIndiaPlaceSlug = "";
        syncMapState();
        hidePill(pillNode);
        applyTransform(d3.zoomIdentity);
    }

    function applyTransform(transform) {
        svg.transition().duration(700).call(zoom.transform, transform);
    }

    syncMapState();
}

function initTravelTimeline({ d3, timelineNode }) {
    const timelineItems = TRAVEL_COUNTRIES.filter((country) => country.timelineFill && Number.isFinite(country.startYear) && Number.isFinite(country.endYear));
    const minYear = d3.min(timelineItems, (item) => item.startYear);
    const maxYear = d3.max(timelineItems, (item) => item.endYear);
    const years = d3.range(minYear, maxYear + 1);

    const render = () => {
        const frame = timelineNode.closest(".travel-timeline-frame");
        const viewportWidth = Math.max(frame?.clientWidth ?? 0, 980);
        const width = Math.max(viewportWidth, TIMELINE_MIN_WIDTH);
        const padding = {
            top: 28,
            right: 28,
            bottom: 92,
            left: 28,
        };
        const x = d3.scaleLinear().domain([minYear, maxYear + 1]).range([padding.left, width - padding.right]);
        const layout = buildTimelineLayout(timelineItems, x);
        const laneCount = d3.max(layout, (item) => item.lane) + 1;
        const axisY = padding.top + laneCount * TIMELINE_LANE_GAP + 8;
        const height = axisY + padding.bottom;

        const svg = d3
            .select(timelineNode)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);
        svg.selectAll("*").remove();

        const defs = svg.append("defs");
        createGradientDefs(defs, timelineItems, "timelineFill", "timeline");

        svg.append("rect").attr("class", "travel-timeline__surface").attr("x", 0).attr("y", 0).attr("width", width).attr("height", height).attr("rx", 28);
        svg
            .append("line")
            .attr("class", "travel-timeline__axis-line")
            .attr("x1", padding.left)
            .attr("x2", width - padding.right)
            .attr("y1", axisY)
            .attr("y2", axisY);

        const gridLayer = svg.append("g").attr("class", "travel-timeline__grid");
        years.forEach((year) => {
            const tickX = x(year);
            gridLayer
                .append("line")
                .attr("class", "travel-timeline__year-line")
                .attr("x1", tickX)
                .attr("x2", tickX)
                .attr("y1", padding.top - 8)
                .attr("y2", axisY + 7);

            gridLayer
                .append("text")
                .attr("class", "travel-timeline__year-label")
                .attr("x", tickX - 2)
                .attr("y", axisY + 18)
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "hanging")
                .attr("transform", `rotate(45 ${tickX - 2} ${axisY + 18})`)
                .text(`${year}`);
        });

        const itemsLayer = svg.append("g").attr("class", "travel-timeline__items");
        layout.forEach((item) => {
            const pillY = padding.top + item.lane * TIMELINE_LANE_GAP;
            const group = itemsLayer
                .append("g")
                .attr("class", "travel-timeline__item")
                .attr("tabindex", 0)
                .attr("role", "link")
                .attr("aria-label", `Open ${item.name}`)
                .on("click", () => {
                    window.location.href = item.route;
                })
                .on("keydown", (event) => {
                    if (event.key !== "Enter" && event.key !== " ") {
                        return;
                    }

                    event.preventDefault();
                    window.location.href = item.route;
                });

            group
                .append("rect")
                .attr("class", "travel-timeline__pill")
                .attr("x", item.x)
                .attr("y", pillY - TIMELINE_PILL_HEIGHT / 2)
                .attr("width", item.width)
                .attr("height", TIMELINE_PILL_HEIGHT)
                .attr("rx", TIMELINE_PILL_HEIGHT / 2)
                .attr("fill", `url(#timeline-${item.slug})`);

            group
                .append("text")
                .attr("class", "travel-timeline__pill-label")
                .attr("x", item.centerX)
                .attr("y", pillY)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(item.displayLabel);

            group.append("title").text(`${item.name} (${formatYearRange(item.startYear, item.endYear)})`);
        });
    };

    render();
    window.addEventListener("resize", render, { passive: true });
}

function buildTimelineLayout(items, scale) {
    const laneEnds = [];
    return items
        .slice()
        .sort((left, right) => left.startYear - right.startYear || left.endYear - right.endYear || left.name.localeCompare(right.name))
        .map((item) => {
            const startX = scale(item.startYear);
            const endX = scale(item.endYear + 1);
            const baseWidth = Math.max(endX - startX - 8, 42);
            const minWidth = estimateLabelWidth(item.displayLabel);
            const width = Math.max(baseWidth, minWidth);
            const centerX = (startX + endX) / 2;
            const x = centerX - width / 2;
            const itemEnd = centerX + width / 2;
            let lane = laneEnds.findIndex((laneEnd) => x > laneEnd + 8);

            if (lane === -1) {
                lane = laneEnds.length;
                laneEnds.push(itemEnd);
            } else {
                laneEnds[lane] = itemEnd;
            }

            return {
                ...item,
                x,
                width,
                centerX,
                lane,
            };
        });
}

function buildCountryClassNames(country) {
    const classNames = ["travel-map__country"];
    if (country) {
        classNames.push("is-visited", "is-interactive");
        if (country.slug === "india") {
            classNames.push("is-india-country");
        }
    }
    return classNames.join(" ");
}

function getCountryForFeature(feature) {
    const normalizedId = normalizeCountryKey(feature.id);
    return countryByFeatureId.get(normalizedId) ?? countryByName.get(feature.properties?.name ?? "");
}

function getCountryTabIndex(country, viewMode) {
    if (viewMode !== "world" || !country) {
        return -1;
    }

    if (country.specialMarker) {
        return -1;
    }

    return 0;
}

function computeFeatureTransform(path, feature, d3) {
    const [[x0, y0], [x1, y1]] = path.bounds(feature);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(8, 0.72 / Math.max(dx / MAP_DIMENSIONS.width, dy / MAP_DIMENSIONS.height));
    const translateX = MAP_DIMENSIONS.width / 2 - scale * ((x0 + x1) / 2);
    const translateY = MAP_DIMENSIONS.height / 2 - scale * ((y0 + y1) / 2);

    return d3.zoomIdentity.translate(translateX, translateY).scale(scale);
}

function createGradientDefs(defs, countries, key, prefix) {
    countries.forEach((country) => {
        const fill = country[key];
        if (!fill) {
            return;
        }

        const gradient = defs
            .append("linearGradient")
            .attr("id", `${prefix}-${country.slug}`)
            .attr("gradientUnits", "objectBoundingBox");

        const vector = getGradientVector(fill.direction);
        gradient.attr("x1", vector.x1).attr("y1", vector.y1).attr("x2", vector.x2).attr("y2", vector.y2);

        fill.stops.forEach(([offset, color]) => {
            gradient.append("stop").attr("offset", formatGradientOffset(offset)).attr("stop-color", color);
        });
    });
}

function createFlagFill(direction, stops) {
    return {
        direction,
        stops,
    };
}

function getGradientVector(direction) {
    if (direction === "horizontal") {
        return { x1: "0%", y1: "0%", x2: "100%", y2: "0%" };
    }

    if (direction === "diagonal") {
        return { x1: "0%", y1: "0%", x2: "100%", y2: "100%" };
    }

    return { x1: "0%", y1: "0%", x2: "0%", y2: "100%" };
}

function formatGradientOffset(offset) {
    return typeof offset === "number" ? `${offset * 100}%` : offset;
}

function normalizeCountryKey(value) {
    if (value === null || value === undefined || value === "") {
        return "";
    }

    const normalized = String(value).replace(/^0+/, "");
    return normalized || "0";
}

function buildTravelRoute(slug) {
    return `${TRAVEL_ROUTE_BASE}${encodeURIComponent(slug)}/`;
}

function buildTravelHoverLabel(name, startYear, endYear) {
    if (!Number.isFinite(startYear)) {
        return name.toUpperCase();
    }

    return `${name.toUpperCase()} - ${formatYearRange(startYear, endYear)}`;
}

function showPill(node, label) {
    node.textContent = label;
    node.hidden = false;
    requestAnimationFrame(() => {
        node.classList.add("is-visible");
    });
}

function hidePill(node) {
    node.classList.remove("is-visible");
    node.hidden = true;
    node.textContent = "";
}

function estimateLabelWidth(label) {
    return Math.max(88, label.length * 8.4 + 24);
}

function formatYearRange(startYear, endYear) {
    if (startYear === endYear) {
        return `${startYear}`;
    }

    return `${startYear}-${endYear}`;
}
