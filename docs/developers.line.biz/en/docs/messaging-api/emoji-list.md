---
Source: https://developers.line.biz/en/docs/messaging-api/emoji-list/
Generated: 2026-06-06
Updated: 2026-06-06
---

# LINE emoji

Using the Messaging API, you can use LINE emoji in text messages. For instructions to send text messages, see [Send messages](/en/docs/messaging-api/sending-messages/).

"LINE original unicode emojis" is discontinued as of March 31, 2022

Instead of "LINE original unicode emojis", use LINE emoji with the `emojis` property. For more information, see the news from April 1, 2022, ["LINE original unicode emojis" of the Messaging API has been discontinued as of March 31, 2022](/en/news/2022/04/01/line-original-unicode-emojis-has-been-discontinued/).

Supported emoji types in text messages

In [text messages](/en/reference/messaging-api/#text-message) and [text messages (v2)](/en/reference/messaging-api/#text-message-v2), you can use Unicode emoji in addition to LINE emoji.

| Emoji type | Object type | How to use |
| --- | --- | --- |
| LINE emoji | Text message | Specify the emoji's product ID and emoji ID in the `emojis` property. |
| LINE emoji | Text message (v2) | Specify the emoji's product ID and emoji ID in the [emoji object](/en/reference/messaging-api/#text-message-v2-emoji-object). |
| Unicode emoji | Text message , Text message (v2) | Enter emoji as they are or enter Unicode code points in the `text` property. |

##

[Specify LINE emojis in message objects](#specify-emojis-in-message-object)

To send an emoji, specify the product ID and emoji ID of the emoji in a [text message](/en/reference/messaging-api/#text-message) object or [text message (v2)](/en/reference/messaging-api/#text-message-v2) object. For example, when using a text message, specify the `emojis.productId` and `emojis.emojiId` properties as shown in the figure below:

![](/media/messaging-api/emojis-object/emojis-object-en.png)

##

[LINE emoji definitions](#line-emoji-definitions)

The number attached to each LINE emoji is the emoji's emoji ID.

**Product ID:**[`670e0cce840a8236ddd4ee4c`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2213e040ab15980c9b447`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21a8c040ab15980c9b43f`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21c4e031a6752fb806d5b`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21e6c040ab15980c9b444`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac1bfd5040ab15980c9b435`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22e85040ab15980c9b44f`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22775040ab15980c9b44c`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2197b040ab15980c9b43d`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21d59031a6752fb806d5d`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac221ca040ab15980c9b449`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22bad031a6752fb806d67`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2211e031a6752fb806d61`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21b4f031a6752fb806d59`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21cce040ab15980c9b443`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21fda040ab15980c9b446`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22224031a6752fb806d62`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22c9e031a6752fb806d68`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac222bf031a6752fb806d64`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21869040ab15980c9b43b`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2280f031a6752fb806d65`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22293031a6752fb806d63`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2173d031a6752fb806d56`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21542031a6752fb806d55`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2216f040ab15980c9b448`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21f52040ab15980c9b445`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21ef5031a6752fb806d5e`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac223c6040ab15980c9b44a`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22b23040ab15980c9b44d`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22def040ab15980c9b44e`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21c46040ab15980c9b442`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22d62031a6752fb806d69`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21a13031a6752fb806d57`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21a18040ab15980c9b43e`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21ba5040ab15980c9b441`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2264e040ab15980c9b44b`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac2206d031a6752fb806d5f`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac220c2031a6752fb806d60`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac22a8c031a6752fb806d66`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac1de17040ab15980c9b438`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21bf9031a6752fb806d5a`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21cc5031a6752fb806d5c`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21ae3040ab15980c9b440`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac218e3040ab15980c9b43c`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all

**Product ID:**[`5ac21184040ab15980c9b43a`](#)

* * *

[`001`](#)

[`002`](#)

[`003`](#)

[`004`](#)

[`005`](#)

[`006`](#)

[`007`](#)

[`008`](#)

[`009`](#)

Show all
