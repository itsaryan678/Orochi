const axios = require("axios");

module.exports = {
  config: {
    name: "prodia",
    version: "2.0",
    author: "Fahim_Noob | ArYAN",
    role: 0,
    shortDescription: {
      en: 'Text to Image'
    },
    category: "image",
    guide: {
      en: `{pn} your prompt | type models here are \n
1 | 3Guofeng3_v34
2 | absolutereality_V16
3 | absolutereality_v181
4 | amIReal_V41
5 | analog-diffusion-1.0.ckpt
6 | anythingv3_0-pruned.ckpt
7 | anything-v4.5-pruned.ckpt
8 | anythingV5_PrtRE
9 | AOM3A3_orangemixs
10 | blazing_drive_v10g
11 | cetusMix_Version35
12 | childrensStories_v13D
13 | childrensStories_v1SemiReal
14 | childrensStories_v1ToonAnime
15 | Counterfeit_v30
16 | cuteyukimixAdorable_midchapter3
17 | cyberrealistic_v33
18 | dalcefo_v4
19 | deliberate_v2
20 | deliberate_v3
21 | dreamlike-anime-1.0
22 | dreamlike-diffusion-1.0
23 | dreamlike-photoreal-2.0
24 | dreamshaper_6BakedVae
25 | dreamshaper_7
26 | dreamshaper_8
27 | edgeOfRealism_eorV20
28 | EimisAnimeDiffusion_V1
29 | elldreths-vivid-mix
30 | epicrealism_naturalSinRC1VAE
31 | ICantBelieveItsNotPhotography_seco
32 | juggernaut_aftermath
33 | lofi_v4
34 | lyriel_v16
35 | majicmixRealistic_v4
36 | mechamix_v10
37 | meinamix_meinaV9
38 | meinamix_meinaV11
39 | neverendingDream_v122
40 | openjourney_V4
41 | pastelMixStylizedAnime_pruned_fp16
42 | portraitplus_V1.0
43 | protogenx34
44 | Realistic_Vision_V1.4-pruned-fp16
45 | Realistic_Vision_V2.0
46 | Realistic_Vision_V4.0
47 | Realistic_Vision_V5.0
48 | redshift_diffusion-V10
49 | revAnimated_v122
50 | rundiffusionFX25D_v10
51 | rundiffusionFX_v10
52 | sdv1_4.ckpt
53 | shoninsBeautiful_v10
54 | theallys-mix-ii-churned
55 | timeless-1.0.ckpt
56 | toonyou_beta6`
    }
  },
  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');

    if (!text) {
      return message.reply("Please provide a prompt with models");
    }

    const [prompt, model] = text.split('|').map((text) => text.trim());
    const models = model || "2";
    let baseURL = `https://c-v3.onrender.com/v1/prodia?prompt=${prompt}&model=${models}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const response = await axios.get(baseURL);
      
      const images = response.data.results;

      if (!images || images.length === 0) {
        throw new Error("No images found in the response");
      }

      const imagesInfo = `Generated ${images.length} images.`;

      message.reply({
        body: imagesInfo,
        attachment: await Promise.all(images.map(img => global.utils.getStreamFromURL(img)))
      }, async (err) => {
        if (err) {
          console.error(err);
        }
      });

    } catch (error) {
      console.error("Error processing request: ", error); 
      message.reply("There was an error processing your request.");
    } finally {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  }
};
