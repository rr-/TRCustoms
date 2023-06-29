import type { LegaleseEntry } from "src/components/common/NestedLegalese";
import { NestedLegalese } from "src/components/common/NestedLegalese";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const TOS: LegaleseEntry = {
  children: [
    {
      title: "Overture",
      description:
        "In this document, the term TRCustoms.org is interchangably used to reference to the website and the website owner(s). If you would like to submit an inquiry relating to the operations of TRCustoms.org, please contact the website administrator via email provided in the About page.",
    },

    {
      title: "Disclaimer",
      description:
        "Lara Croft and Tomb Raider are registered trademarks of CDE Entertainment Ltd. at the time of writing. TRCustoms.org is an unofficial Tomb Raider fan site that is run by and supported by fans; and includes fan creations and different depictions of the mentioned trademark. TRCustoms.org is not funded by or maintained by the trademark owners, nor does it mean to represent their views.",
    },

    {
      title: "Content and Usage",
      children: [
        {
          title: "Content Liability",
          children: [
            {
              description:
                "Parts of this website allow registered users to submit content by uploading or posting on the website. This content does not reflect the views and opinions of TRCustoms.org, or Lara Croft and Tomb Raider’s trademark owners. The contents reflect the views and opinions of the uploader/poster.",
            },
            {
              description:
                "TRCustoms.org will not be held responsible for any content uploaded by users on the website. Users shall be held accountable for downloading or uploading any content that is deemed harmful, obscene, or unlawful and criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of any third-party rights.",
            },
            {
              description:
                "To the extent permitted by applicable laws, TRCustoms.org shall not be liable for the content uploaded onto their platform or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the content on this website. As the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.",
            },
            {
              description:
                "As a registered member, you warrant and represent that:",
              bullets: true,
              children: [
                {
                  description:
                    "The content you submit to TRCustoms.org does not contain any malware.",
                },
                {
                  description:
                    "You will not submit spam, which classifies as submitting content that is not visually or contextually distinguishable from each other within a short period of time.",
                },
                {
                  description:
                    "The content you submit does not invade any intellectual property right, copyright, or trademark of any third party.",
                },
                {
                  description:
                    "The content does not contain any plagiarized, defamatory, libelous, offensive, indecent, or unlawful material.",
                },
                {
                  description:
                    "The content will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.",
                },
                {
                  description:
                    "The content you submit may be used, edited, reproduced in any forms, formats, or media by TRCustoms.org and any website user.",
                },
                {
                  description:
                    "You may resubmit content if you abide to the reason provided at rejection, and as long as it does not go against the Terms and Conditions.",
                },
              ],
            },
          ],
        },

        {
          title: "Content Change Requests",
          children: [
            {
              description:
                "You may request to alter content submitted to TRCustoms.org by using the forms provided via the website, or by contacting the website administrator.",
            },
            {
              description:
                "You may not misuse this feature by defacing or inserting false information after prior approval.",
            },
          ],
        },

        {
          title: "Content Takedowns",
          children: [
            {
              description:
                "Website users may request to takedown their content by contacting the website administrator.",
            },
            {
              description:
                "TRCustoms.org reserves the right to monitor all content on its platform and remove any of it that is deemed inappropriate with or without providing reason.",
            },
            {
              description:
                "TRCustoms.org shall abide by a takedown request issued by the copyright or trademark owner of the content detailed in the request.",
            },
          ],
        },
      ],
    },

    {
      title: "Cookies",
      children: [
        {
          description:
            "TRCustoms.org does not use cookies nor does it store sensitive information using cookies.",
        },
        {
          description:
            "By accessing TRCustoms.org, you agree to use allow TRCustoms.org to save the website’s settings on your browser’s local storage.",
        },
        {
          description:
            "The saved data is used to track user settings that include but are not limited to themes, pagination, and login tokens (for member user accounts).",
        },
      ],
    },

    {
      title: "Privacy Policy",
      children: [
        {
          title: "Data Storage and Use",
          children: [
            {
              description:
                "All data uploaded to TRCustoms.org is hosted on the website's database, including level data, review data, and user profile data previously downloaded from trle.net prior to TRCustoms.org’s launch as permitted by trle.net's webmaster.",
            },
            {
              description:
                "All data you provide that is stored in the database of TRCustoms.org will be used exclusively for the services provided by the website and will not be utilized in any other way or made available to any third party unless required by law.",
            },
          ],
        },

        {
          title: "Member Usage",
          children: [
            {
              title: "Data Collection",
              bullets: true,
              children: [
                {
                  description:
                    "Registering for website membership does not require Personally Identifiable Information (PII) apart from your email address.",
                },
                {
                  description:
                    "TRCustoms.org may optionally collect PII such as your first name, last name, your photo in avatars, donation links, or other data submitted by you deemed as such only by your explicit input in the website's pages via entry points that include but are not limited to forms, text boxes, upload widgets.",
                },
                {
                  description:
                    "TRCustoms.org reserves the right to terminate your membership or reject your requests for any or no reason.",
                },
              ],
            },
            {
              title: "Visibility",
              bullets: true,
              children: [
                {
                  description:
                    "All information you provide, including PII, will be visible publicly on TRCustoms.org.",
                },
                {
                  description:
                    "Your email address is the only PII that will remain hidden in our records.",
                },
              ],
            },
            {
              title: "Email Communication",
              bullets: true,
              children: [
                {
                  description:
                    "Once you provide your email address, you agree to receive emails from TRCustoms.org.",
                },
              ],
            },
          ],
        },

        {
          title: "PII Removal",
          children: [
            {
              description:
                "You may delete the any of the PII you provided at any time by removing the information or contacting TRCustoms.org site administrator.",
            },
            {
              description:
                "Choosing to revoke your valid email address will result in the inability to access your account, thus revoking your membership; however, it does not affect your user profile as all non-PII in it is retained.",
            },
          ],
        },
      ],
    },

    {
      title: "Termination of Membership",
      description:
        "You may request the deactivation of your account at any time by contacting the administrator.",
    },

    {
      title: "Amendments",
      description:
        "We reserve the right to update the Terms and Conditions as we see fit. Our Terms and Conditions have not been updated since launch.",
    },
  ],
};

const TermsAndConditionsPage = () => {
  usePageMetadata(() => ({ ready: true, title: "Terms and Conditions" }), []);

  return (
    <PlainLayout>
      <NestedLegalese prefix="tos" title="Terms and Conditions" entry={TOS} />
    </PlainLayout>
  );
};

export { TermsAndConditionsPage };
