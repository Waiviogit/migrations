const _ = require('lodash');
const franc = require('franc-min');

const { getClient } = require('../../client');
const { DATABASE, COLLECTION } = require('../../contants/db');
const { getFormattedLanguages } = require('../../helpers/formatHelper');
const { LANGUAGE_LIST } = require('../../contants/language');

const up = async ({ notProcessed = false } = {}) => {
  const { db, client } = await getClient(DATABASE.WAIVIO);
  const collection = db.collection(COLLECTION.POSTS);
  let processed = 0;
  const records = 8000000;

  const start = process.hrtime();

  try {
    const limit = 1000;

    if (notProcessed) {
      await collection.updateMany({}, { $set: { notProcessed: true } });
      console.log(' notProcessed: true success');
    }
    while (true) {
      const posts = await collection.find({ notProcessed: true }, { limit }).toArray();
      processed += posts.length;
      for (const post of posts) {
        const text = `
        ${post.title.replace(/(?:!?\[(.*?)\]\((.*?)\))|(<\/?[^>]+(>|$))/g, '')}
        ${post.body.replace(/(?:!?\[(.*?)\]\((.*?)\))|(<\/?[^>]+(>|$))/g, '')}
        `;
        const languages = getFormattedLanguages(
          { languages: franc.all(text, { only: Object.keys(LANGUAGE_LIST) }).splice(0, 2) },
        );
        if (_.isEmpty(languages)) {
          languages.push(post.language);
        }
        await collection.updateOne({ _id: post._id }, {
          $addToSet: { languages: { $each: languages } },
          $set: { notProcessed: false },
        });
      }
      const end = process.hrtime(start);
      const passed = end[1] / 1000000;
      const last = (records * passed) / processed / 1000 / 60;
      console.log(`processed count ${processed}`);
      console.log(`time to end ${last} minutes`);
      if (posts.length < 1000) break;
    }
    console.log('migration success');
  } catch (e) {
    console.error(e.message);
  } finally {
    await client.close();
  }
};

const down = async () => {
  const { db, client } = await getClient(DATABASE.WAIVIO);
  const collection = db.collection(COLLECTION.POSTS);
  await collection.updateMany({}, { $set: { notProcessed: true }, $unset: { languages: '' } });
  await client.close();
  console.log('migration success');
};

(async () => {
  await up();
})();
