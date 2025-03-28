import WidgetUtils from "../../../utils/WidgetUtils";
import { CategoryKey } from "./Category";
import { type Emoji as IEmoji } from "@matrix-org/emojibase-bindings";
import React from "react";

async function getCustomEmojiCategories() {
    const client = window.mxMatrixClientPeg.get()
    if (!client) {
        return []
    }

    const stickerpickerWidget = WidgetUtils.getStickerpickerWidgets(client)[0];
    let url = stickerpickerWidget?.content?.url ?? null;
    if (url == null) {
        return []
    }
    url = url.slice(0, url.indexOf("?"))

    const index_response = await fetch(`${url}/packs/index.json`);
    const index = await index_response.json();

    const categories = [];

    const packs = index["packs"];
    for (const pack of packs) {
        const sticker_response = await fetch(`${url}/packs/${pack}`);
        const sticker = await sticker_response.json();

        const title = sticker["title"];
        categories.push({
            id: title.toLowerCase(),
            name: title,
            enabled: true,
            visible: true,
            ref: React.createRef(),
        });
    }

    return categories;
}

async function getCustomEmojis(): Promise<Record<CategoryKey, IEmoji[]>> {
    const client = window.mxMatrixClientPeg.get()
    if (!client) {
        return {}
    }

    const stickerpickerWidget = WidgetUtils.getStickerpickerWidgets(client)[0];
    let url = stickerpickerWidget?.content?.url ?? null;
    if (url == null) {
        return {}
    }
    url = url.slice(0, url.indexOf("?"))

    const index_response = await fetch(`${url}/packs/index.json`);
    const index = await index_response.json();

    const emojis: Record<CategoryKey, IEmoji[]> = {};

    const packs = index["packs"];
    for (const pack of packs) {
        const sticker_response = await fetch(`${url}/packs/${pack}`);
        const sticker = await sticker_response.json();

        const title = sticker["title"];
        const s = sticker["stickers"].map((x: { body: any; url: any }) => ({
            label: x.body,
            shortcodes: [x.body],
            tags: [x.body],
            unicode: x.url,
            hexcode: x.body,
        }));

        if (s.length > 0) {
            emojis[title.toLowerCase()] = s;
        }
    }

    return emojis;
}

export let custom_emojis = await getCustomEmojis();
export let custom_emoji_categories = await getCustomEmojiCategories();

let timeout = 1000

const update = async () => {
    custom_emojis = await getCustomEmojis();
    custom_emoji_categories = await getCustomEmojiCategories();

    if (custom_emoji_categories.length > 0) {
        timeout = 60000
    }

    setTimeout(async () => {
        update()
        
    }, timeout)
}

setTimeout(async () => {
    update()
    
}, timeout)