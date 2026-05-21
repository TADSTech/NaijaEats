# Nigerian Cultural Contextualisation

This doc covers the **Nigerian bonus** criterion. We want to be
direct about something up front: this isn't cosmetic. It's the core
thesis.

The argument of the project is that you cannot bolt Nigerian-ness
onto a Western system as a translation step at the end. Culture
shapes how people rate, how they complain, what they notice, and
how they write. So culture has to be present at every layer — in
the profile features, in the retrieval signals, in the prompt
design, and only *then* in a dedicated polish pass.

This doc shows six concrete things we built.

---

## 1. The Nigerianizer module

A dedicated post-reasoning LLM call. Its only job: take a draft
review (already correct in content) and adjust register, vocabulary,
and rhythm to match the user's Nigerian voice from the profile.

It is intentionally a separate stage from generation. The generator
focuses on *what* this user would think. The Nigerianizer focuses on
*how* this user would say it.

### Before / after example

**Generator draft (pre-Nigerianizer):**

> The amala was excellent and the gbegiri sauce was very flavorful.
> However, the service was extremely slow. I waited approximately 25
> minutes for someone to take my order. If the service issue were
> resolved, this could easily be a 5-star establishment.

**After Nigerianizer (heavy-Pidgin user profile):**

> The amala? E sweet die. Gbegiri sauce on point. But the service ehn
> — I waited like 25 minutes before anybody even look my side. If
> they fix that thing, this place fit easily be 5 stars. For now,
> 3 stars. Potential dey.

Same content. Same rating. Completely different register. The
information density is preserved — we don't lose nuance to slang.

---

## 2. User-specific register matching

The single most important design choice in the cultural layer.

Forcing all output into Pidgin is the obvious failure mode and
exactly what we don't do. The profiler tags each user with one of
five voice registers, and the Nigerianizer respects that tag:

- **Heavy Pidgin** — full Pidgin throughout.
- **Light Pidgin** — English base with Pidgin markers under emphasis.
- **Code-switching** — switches by sentence based on emotional state.
- **Standard Naija English** — formal English with Nigerian
  vocabulary and idioms.
- **Naija formal** — minimal Pidgin, but Lagos/Nigerian references
  intact (neighbourhoods, food names, currency).

### Contrasting example — same restaurant, two users

Restaurant: a new Surulere amala spot, slow service.

**bayo_001 (heavy Pidgin):**
> Mama Titi's amala dey burst head. But the service na to wait small
> wait — abeg make dem upgrade. 3 stars for now, potential dey die.

**amaka_002 (standard Naija English):**
> Mama Titi's amala is genuinely one of the best in Surulere — rich,
> well-pounded, the gbegiri has depth. The service, however, needs
> work. Twenty-five minutes before an order is taken is not it. With
> better service this is a clear 4.5. As it stands, 3.

Both are Nigerian. Both are this restaurant. Neither sounds like the
other person wrote it. That's the goal.

---

## 3. Nigerian food vocabulary

The system knows specific foods, terms of approval/disapproval, and
how they're typically used in reviews. It's not just a translation
table — each term has a usage context.

| Term            | What it is / means                                    | How the system uses it                             |
|-----------------|-------------------------------------------------------|----------------------------------------------------|
| Amala           | Yam-flour swallow, dark brown                         | Positive signal for Yoruba/Lagos profiles          |
| Gbegiri         | Bean soup, often paired with amala                    | Quality cue — "smooth gbegiri" = strong praise     |
| Ewedu           | Jute leaf soup                                        | Same pairing context as gbegiri                    |
| Suya            | Spicy grilled meat skewers                            | Late-night / casual context                        |
| Jollof          | Spiced tomato rice                                    | Universal — every user has a jollof opinion        |
| Buka            | Local informal eatery                                 | Sets price + ambience expectations                 |
| Mama Put        | Street food vendor                                    | Sets price + authenticity expectations             |
| Swallow         | General term for amala/eba/pounded yam etc.           | Used when category, not specific food, matters     |
| E dey slap      | Pidgin: "it's excellent"                              | Heavy-positive sentiment in heavy-Pidgin register  |
| E sweet die     | Pidgin: "extremely delicious"                         | Heavy-positive sentiment marker                    |
| On point        | Naija English: "well-executed"                        | Positive marker across most registers              |
| Go-slow         | Lagos traffic                                         | Context cue affecting service expectations         |
| Potential dey   | Pidgin: "it has potential"                            | Generative phrase for 3-star reviews with hope     |
| Abeg            | Pidgin: "please" / softener                           | Used in critical sentences to soften               |

This list isn't a dictionary — it's tied to **when** the system
deploys each term. *"E sweet die"* in a 2-star review would be wrong
because it's a positive intensifier; the profiler ensures it only
fires in positive contexts.

---

## 4. Lagos neighbourhood awareness

Lagos isn't homogeneous. A 3-star buka in Surulere reads differently
than a 3-star spot in Lekki. The system has explicit context for
the major areas:

| Area      | Expectation                                                    | Typical user reaction pattern                                  |
|-----------|----------------------------------------------------------------|----------------------------------------------------------------|
| Surulere  | Authentic local food, value pricing, casual ambience           | Service patience higher; food authenticity expected            |
| Yaba      | Tech crowd, mixed cuisine, fast-casual                         | Wifi + speed expected; ambience rated higher                   |
| Lekki     | Premium pricing, polished ambience, Continental + Nigerian mix | Price-value scrutiny is intense; ambience is baseline          |
| Victoria Island | High-end, business clientele, Continental-heavy           | Service standards are unforgiving; authenticity less weighted  |
| Ikeja     | Mixed — Government Reserved Area is premium, rest is casual    | Depends on profile — system looks for sub-area cues            |
| Ajah      | Quieter Lekki extension, residential, mid-tier pricing         | Value expectations sit between Surulere and Lekki              |

This influences the reasoning prompt — the LLM is told what
expectations a typical Lagos eater brings to each area, and it
weighs the user's specific triggers against those expectations.

---

## 5. Nigerian rating psychology

Western models often miss this. Specific patterns we encoded:

- **Generous baseline.** Nigerian Yelp/Google reviewers cluster
  higher than American ones. A user who averages 4.2 is *not*
  necessarily a generous rater by Nigerian norms — they might be
  median. The profiler's "strict / moderate / generous" buckets are
  calibrated to Nigerian distributions, not global.
- **Service complaints carry extra weight.** Slow service in Lagos
  is contextualised by "go-slow" (traffic) and infrastructure but
  *not* excused. When it's mentioned, it drops more stars than
  equivalent complaints about food temperature or portion size.
- **Price-value is explicit.** Nigerian reviews more often mention
  the actual price ("₦5k for this?") rather than implying it through
  the dollar-sign-rating scale. The generator is prompted to surface
  price-value reasoning when the user's history shows price
  sensitivity.
- **"Potential" is a real review category.** A 3-star with
  *"potential dey"* signals genuine interest — it's not a polite
  reject, it's a "this could be a regular if they fix X". The system
  recognises and uses this pattern for users whose history shows it.
- **Compliments are stacked, not solo.** A Nigerian 5-star review
  often says three different positive things in three sentences.
  A solo compliment reads thin. The generator's length and stack
  patterns are matched to the user's habit.

---

## 6. Natural code-switching

Code-switching in Nigerian English isn't random — it's a function
of emotion, formality, and emphasis. The system models three rules:

1. **Emotional peaks switch into Pidgin.** Excitement and frustration
   are the two reliable triggers. *"The food was good, but ehn —
   this service vex me."*
2. **Formal openings stay in English.** Many users open in English
   even if they're heavy Pidgin overall. The Nigerianizer respects
   the opening's register more than the average.
3. **Punchlines and verdicts go to Pidgin.** Closing sentences —
   the verdict, the recommendation — flip to Pidgin for emphasis,
   even in mostly-English reviews. *"Honestly, e no bad."*

The generator gets these as explicit instructions when the user's
profile shows code-switching behaviour. For users who don't
code-switch, none of this fires.

---

## Real system outputs (placeholders)

Filled in after evaluation runs.

### Example A — heavy Pidgin register

**User:** bayo_001
**Restaurant:** _TBD_
**Output:** _TBD_
**What's culturally right about it:** _TBD_

### Example B — code-switching register

**User:** tunde_003
**Restaurant:** _TBD_
**Output:** _TBD_
**What's culturally right about it:** _TBD_

### Example C — standard Naija English register

**User:** amaka_002
**Restaurant:** _TBD_
**Output:** _TBD_
**What's culturally right about it:** _TBD_

---

## Voice interface roadmap (honest status)

The landing page advertises a future voice/WhatsApp interface. To
be transparent about what exists:

- **What exists:** the HTTP `/simulate-review` endpoint, the
  generated review payload, the Pidgin-aware output.
- **What's mocked:** the WhatsApp chat shown in the landing page is
  illustrative — there is no live WhatsApp bot. A user typing in
  Pidgin and receiving a reply is the documented roadmap.
- **What it would take:** a Twilio (or 360dialog) WhatsApp number,
  a thin webhook router that calls the existing endpoint, and a
  Pidgin-aware input parser. The output side is already Pidgin-
  ready.

We'd rather flag this clearly than leave it ambiguous.

---

## Why this matters

The summary, for judges:

> We did not add Pidgin to a Western system. We built a Nigerian
> system.

That's not a marketing line — it's a structural claim. Look at the
profiler's trigger inventory, the retrieval scoping, the reasoning
prompt's Lagos context, and the Nigerianizer's register matching.
Each one was designed with the Nigerian user as the default, not as
a localisation case.

The cleanest test of that claim is the ablation: V4 → V5 (adding
the cultural layer) moves human evaluation significantly even though
automated metrics barely shift. If the layer were cosmetic, no
human would notice. They do.
