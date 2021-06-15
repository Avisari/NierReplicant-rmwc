let GrandTotalMatMap = new Map();
let GlobalMatMap = new Map();
let jsonData;
let Mats;
let ChkSavestate = new Map();

$(document).ready(function () {
    $.getJSON("mats.json").fail(function (jqXHR, textStatus, errorThrown) {
        console.log('getJSON mats.json request failed! ' + textStatus);
        alert('Something went wrong loading the materials data, try reloading the page.');
    }).done(function (data) {
        Mats = data.Materials;

        $.getJSON("weapons.json").fail(function (jqXHR, textStatus, errorThrown) {
            console.log('getJSON weapons.json request failed! ' + textStatus);
            alert('Something went wrong loading the weapons data, try reloading the page.');
        }).done(function (data) {
            $.each(data.Weapons, function (k, v1) {
                tr = $('<tr></tr>');

                tr.append(BuildTd(v1.Name));
                tr.append(BuildTd(v1.Type));

                let MatMap = new Map();

                $.each(v1.Levels, function (k2, v2) {
                    let chk = BuildChk(k, k2);

                    $.each(v2.Materials, function (k3, v3) {
                        v3.Name = Mats.find(k => k.ID == v3.Name).Name;
                    });

                    v2.Materials.sort((a, b) => a.Name.localeCompare(b.Name));
                    td2 = BuildTd("");
                    td2.attr('class', 'MatsTD').attr('id', 'MatsTD_' + k + '_' + k2);
                    $.each(v2.Materials, function (k3, v3) {
                        td2.append(BuildDiv(v3.Name, v3.Amount));
                        if (!chk.is(':checked')) MatMap = AddToMap(MatMap, v3.Name, v3.Amount);
                    });

                    if (chk.is(':checked')) td2.toggleClass('LevelDone');
                    //if (chk.is(':checked')) td2.attr('class', td2.attr('class') + ' LevelDone');

                    td = BuildTd("");
                    td.append(chk);
                    tr.append(td);
                    tr.append(td2);
                });

                GlobalMatMap = AddToGlobalMap(GlobalMatMap, v1.Name, MatMap);
                td = BuildTd("");
                td.attr('class', 'MatsTD').attr('id', 'TotalMatsTD_' + k);
                MatMap = new Map([...MatMap.entries()].sort());
                MatMap.forEach(function (v, k) {
                    td.append(BuildDiv(k, v));
                });
                tr.append(td);

                switch (v1.Type) {
                    case "One-handed sword":
                        $('#one_handed_swords_table tbody').append(tr);
                        break;
                    case "Two-handed sword":
                        $('#two_handed_swords_table tbody').append(tr);
                        break;
                    case "Spear":
                        $('#spear_table tbody').append(tr);
                        break;
                }
            });

            GlobalMatMap.forEach(function (v, k) {
                v.forEach(function (v2, k2) {
                    GrandTotalMatMap = AddToMap(GrandTotalMatMap, k2, v2);
                });
            });
            GrandTotalMatMap = new Map([...GrandTotalMatMap.entries()].sort());
            GrandTotalMatMap.forEach(function (v, k) {
                $('#GrandTotalDiv').append(BuildGrandTotalDiv(k, v));
            });

            jsonData = data.Weapons;
        });
    });
});


function AddToGlobalMap(m, n, v) {
    m.set(n, v);
    return m;
}
function AddToMap(m, n, v) {
    if (m.has(n)) {
        m.set(n, m.get(n) + v);
    } else {
        m.set(n, v);
    }
    return m;
}
function SubFromMap(m, n, v) {
    if (m.has(n)) {
        if (m.get(n) - v == 0) {
            m.delete(n);
        } else {
            m.set(n, m.get(n) - v);
        }
    }
    return m;
}
function BuildChk(k, k2) {
    let id = 'chk_' + k + '_' + k2;
    let = SavedState = GetFromLocalStorage(id);
    let input = $('<input type="checkbox" />');
    if (SavedState == 'true') input.attr('checked', SavedState)
    return input.attr('id', id).click(function () {

        let m = GlobalMatMap.get(jsonData[k].Name);
        let m2 = GrandTotalMatMap;
        if ($(this).is(':checked')) {
            $.each(jsonData[k].Levels[k2].Materials, function (k3, v3) {
                m = SubFromMap(m, v3.Name, v3.Amount);
                m2 = SubFromMap(m2, v3.Name, v3.Amount);
            });
            SetLocalStorageValue($(this).attr('id'), $(this).is(':checked'));
        } else if (!$(this).is(':checked')) {
            $.each(jsonData[k].Levels[k2].Materials, function (k3, v3) {
                m = AddToMap(m, v3.Name, v3.Amount);
                m2 = AddToMap(m2, v3.Name, v3.Amount);
            });
            RemoveFromLocalStorage($(this).attr('id'), $(this).is(':checked'));
        }

        $('#MatsTD_' + k + '_' + k2).toggleClass('LevelDone');

        $('#TotalMatsTD_' + k).html('');
        m = new Map([...m.entries()].sort());
        m.forEach(function (v4, k4) {
            $('#TotalMatsTD_' + k).append(BuildDiv(k4, v4));
        });
        $('#GrandTotalDiv').html('');
        m2 = new Map([...m2.entries()].sort());
        m2.forEach(function (v4, k4) {
            $('#GrandTotalDiv').append(BuildGrandTotalDiv(k4, v4));
        });
    });
}
function BuildTd(text) {
    td = $('<td></td>').html(text);
    return td;
}
function BuildDiv(n, v) {
    div = $('<div data-name="' + n + '" data-amount="' + v + '"></div>').html(n + ' x' + v);
    return div;
}
function BuildGrandTotalDiv(n, v) {
    div = $('<div data-name="' + n + '" data-amount="' + v + '"></div>').html(n);
    return div;
}
function SetLocalStorageValue(i, v) {
    localStorage.setItem(i, v);
}
function GetFromLocalStorage(i) {
    return localStorage.getItem(i);
}
function RemoveFromLocalStorage(i) {
    return localStorage.removeItem(i);
}