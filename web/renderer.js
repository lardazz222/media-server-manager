

async function getConfig(){
    const cfg = await window.api.getConfig();
    return cfg;
}
async function setConfig(config){
    await window.api.setConfig(config);
}

let storage_data = null;



$("#add-media-location").on("click", async function(e) {
    // disable and add disabled class
    $(this).addClass("disabled");
    $(this).attr("disabled", true);
    // prevent default
    e.preventDefault();
    e.stopPropagation();
    const dir = await window.api.getDirectoryDialog();
    if (dir == undefined || dir == null){
        $(this).removeClass("disabled");
        $(this).attr("disabled", false);
        return
    }
    const cfg = await getConfig();
    if (cfg.media_locations == undefined){
        cfg.media_locations = [];
    }
    if (cfg.media_locations.includes(dir)){
        console.log(`[add-media-location] ${dir} already exists`);
        $(this).removeClass("disabled");
        $(this).attr("disabled", false);
        return;
    }
    cfg.media_locations.push(dir);
    const r = await setConfig(cfg);
    console.log(`[add-media-location] ${dir}`)
    // undisable
    $(this).removeClass("disabled");
    $(this).attr("disabled", false);
});

async function load_storage_page(){
    // load this page
    const cfg = await getConfig();
    const dir = cfg.media_locations;
    $("#locations-viewer").empty();
    $("#space-bars").empty();
    // console.log(`[storage] ${(storage_data.total / 1024).toFixed(2)} GB out of ${(storage_data.free_space / 1024).toFixed(2)} GB used`)
    var directory_list = []
    var colors = ["purple", "orange", "yellow", "green", "red", "blue"]
    // randomize list
    colors = colors.sort(() => Math.random() - 0.5);
    var color_index = 0;
    for (var d of dir){
    
        var used_mb = storage_data[d];
        var percent_of_total = (used_mb / storage_data.free_space) * 100;

        // console.log(`[storage] ${d} uses ${percent_of_total.toFixed(2)}% of the free space (${(storage_data.free_space / 1024).toFixed(2)} GB)`)
        // append to the list
        directory_list.push({
            "directory": d,
            "percent_of_total": percent_of_total,
            "color": colors[color_index],
            "size": (used_mb / 1024).toFixed(2)
        })
        color_index += 1;
        var elem = $(`
            <div class="location-item">
                <img src="assets/folder.png">
                <span>${d}</span>
            </div>
        `)

        

        // on click, remove and update config
        elem.on("click", async function(e){
            // prevent default
            e.preventDefault();
            e.stopPropagation();
            // get the text
            var text = $(this).find("span").text();
            // remove from config
            const cfg = await getConfig();
            cfg.media_locations = cfg.media_locations.filter(function(e) { return e !== text })
            const r = await setConfig(cfg);
            // reload page
            await load_storage_page();
        })

        $("#locations-viewer").append(elem);
    }
    // sort the list by highest percent of total
    directory_list.sort(function(a, b) {
        return b.percent_of_total - a.percent_of_total;
    });
    var total_percents = 0;
    for (var d of directory_list){
        // we will create a custom bar and add it to #space-bars
        var bar = $(`<div class="inner-bar ${d.color}"></div>`);
        bar.css("width", `${d.percent_of_total}%`);
        // set the z index of the lowest bar to 100, and the highest to 1
        bar.css("z-index", `${d.percent_of_total}`);
        // set the left to the total percents
        bar.css("left", `${total_percents}%`);

        // add a tippy to the bar
        tippy(bar[0], {
            content: `${d.directory} ${d.size} GB (${d.percent_of_total.toFixed(2)}%)`,
            placement: "bottom",
            theme: "custom",
            arrow: true,
            delay: [0, 0],
        });


        // add to the bar
        $("#space-bars").append(bar);
        total_percents += d.percent_of_total;
        // add a tippy to the background indicating free space
        tippy($("#space-bars")[0], {
            content: `Free Space: ${(storage_data.free_space / 1024).toFixed(2)} GB`,
            placement: "top",
            theme: "custom",
            arrow: true,
            delay: [0, 0],
        })
    }


}

// on obj with target=storage-content-panel
// on click
$("[target=storage-content-panel]").on("click", async function(e) {
    // prevent default
    e.preventDefault();
    e.stopPropagation();
    // load storage page
    await load_storage_page();
})



$(document).ready(async function(){
    const cfg = await window.api.getConfig();
    // get the last time
    const last_time = cfg.time;
    var seconds_since_last = (new Date().getTime() - last_time) / 1000;
    console.log(`[storage] seconds since last: ${seconds_since_last} seconds (from ${cfg.storage_index_interval})`)
    // if it has been more than cfg.storage_index_interval seconds, update the storage index
    if (seconds_since_last > cfg.storage_index_interval){
        var storage_index = await window.api.getStorageIndex();
        cfg.time = new Date().getTime();

    }else{
        // get the storage index from storage
        if (cfg.cached_storage_index != null){
            var storage_index = cfg.cached_storage_index;
        }else{
            console.log("[storage] no cached storage index, getting new one")
            var storage_index = await window.api.getStorageIndex();
            cfg.cached_storage_index = storage_index;
            cfg.time = new Date().getTime();

        }
    }
    window.api.setConfig(cfg);
    // set the time to update the storage index
    storage_data = storage_index;
    await load_storage_page();
    $("#free-space-id").text(`Free Space: ${(storage_data.free_space / 1024).toFixed(2)} GB`)
    
    // find used
    var used = 0;
    for (var key in storage_data){
        if (key != "free_space" && key != "total"){
            used += storage_data[key];
        }
    }
    $("#used-space-id").text(`Used Space: ${(used / 1024).toFixed(2)} GB`)
})


$("#refresh-storage-index").on("click", async function(e){
    // disable button
    $("#refresh-storage-index").attr("disabled", true);
    // add disabled class
    $("#refresh-storage-index").addClass("disabled");
    // prevent default
    e.preventDefault();
    e.stopPropagation();
    // get the storage index
    var storage_index = await window.api.getStorageIndex();
    // set the time to update the storage index
    storage_data = storage_index;
    await load_storage_page();
    $("#free-space-id").text(`Free Space: ${(storage_data.free_space / 1024).toFixed(2)} GB`)
    
    // find used
    var used = 0;
    for (var key in storage_data){
        if (key != "free_space" && key != "total"){
            used += storage_data[key];
        }
    }
    $("#used-space-id").text(`Used Space: ${(used / 1024).toFixed(2)} GB`)
    // enable button
    $("#refresh-storage-index").attr("disabled", false);
    // remove disabled class
    $("#refresh-storage-index").removeClass("disabled");
})