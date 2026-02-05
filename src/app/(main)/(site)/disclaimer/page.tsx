import type { Metadata } from "next";
import { Anchor, Text, Title } from "@mantine/core";

export const metadata: Metadata = {
  title: "Disclaimer",
  alternates: {
    canonical: "/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <Title my="lg" fw="bold" ta="center">
        DISCLAIMER
      </Title>
      <Text my="md">Last updated: 2024-05-07</Text>
      <Text my="md">
        <Text span fw="bold">
          WEBSITE DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        The information provided by{" "}
        <Text span fw="bold">
          StickyThoughts
        </Text>{" "}
        (“Company”, “we”, “our”, “us”) on{" "}
        <Text span fw="bold">
          https://www.stickythoughts.app/
        </Text>{" "}
        (the “Site”) is for general informational purposes only. All information
        on the Site is provided in good faith, however we make no representation
        or warranty of any kind, express or implied, regarding the accuracy,
        adequacy, validity, reliability, availability, or completeness of any
        information on the Site.
      </Text>
      <Text my="md">
        UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR
        DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR
        RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE
        AND YOUR RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN
        RISK.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          EXTERNAL LINKS DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        The Site may contain (or you may be sent through the Site) links to
        other websites or content belonging to or originating from third parties
        or links to websites and features. Such external links are not
        investigated, monitored, or checked for accuracy, adequacy, validity,
        reliability, availability or completeness by us.
      </Text>
      <Text my="md">
        For example, the outlined{" "}
        <Anchor href="https://policymaker.io/disclaimer/">Disclaimer</Anchor>{" "}
        has been created using{" "}
        <Anchor href="https://policymaker.io/">PolicyMaker.io</Anchor>, a free
        web application for generating high-quality legal documents.
        PolicyMaker’s{" "}
        <Anchor href="https://policymaker.io/disclaimer/">
          disclaimer generator
        </Anchor>{" "}
        is an easy-to-use tool for creating an excellent sample Disclaimer
        template for a website, blog, eCommerce store or app.
      </Text>
      <Text my="md">
        WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR THE
        ACCURACY OR RELIABILITY OF ANY INFORMATION OFFERED BY THIRD-PARTY
        WEBSITES LINKED THROUGH THE SITE OR ANY WEBSITE OR FEATURE LINKED IN ANY
        BANNER OR OTHER ADVERTISING. WE WILL NOT BE A PARTY TO OR IN ANY WAY BE
        RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND THIRD-PARTY
        PROVIDERS OF PRODUCTS OR SERVICES.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          AFFILIATES DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        The Site may contain links to affiliate websites, and we may receive an
        affiliate commission for any purchases or actions made by you on the
        affiliate websites using such links.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          ERRORS AND OMISSIONS DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        While we have made every attempt to ensure that the information
        contained in this site has been obtained from reliable sources,
        StickyThoughts is not responsible for any errors or omissions or for the
        results obtained from the use of this information. All information in
        this site is provided “as is”, with no guarantee of completeness,
        accuracy, timeliness or of the results obtained from the use of this
        information, and without warranty of any kind, express or implied,
        including, but not limited to warranties of performance,
        merchantability, and fitness for a particular purpose.
      </Text>{" "}
      <Text my="md">
        In no event will StickyThoughts, its related partnerships or
        corporations, or the partners, agents or employees thereof be liable to
        you or anyone else for any decision made or action taken in reliance on
        the information in this Site or for any consequential, special or
        similar damages, even if advised of the possibility of such damages.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          GUEST CONTRIBUTORS DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        This Site may include content from guest contributors and any views or
        opinions expressed in such posts are personal and do not represent those
        of StickyThoughts or any of its staff or affiliates unless explicitly
        stated.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          LOGOS AND TRADEMARKS DISCLAIMER
        </Text>
      </Text>
      <Text my="md">
        All logos and trademarks of third parties referenced on
        https://www.stickythoughts.app/ are the trademarks and logos of their
        respective owners. Any inclusion of such trademarks or logos does not
        imply or constitute any approval, endorsement or sponsorship of
        StickyThoughts by such owners.
      </Text>
      <Text my="md">
        <Text span fw="bold">
          CONTACT US
        </Text>
      </Text>
      <Text my="md">
        Should you have any feedback, replies, requests for technical support
        or other inquiries, please contact us by email:{" "}
        <Text span fw="bold">
          ho.alexander.g@gmail.com
        </Text>
        .
      </Text>
      <Text mt="xl" mb="md" fz="xs">
        This{" "}
        <Anchor href="https://policymaker.io/disclaimer/" inherit>
          Disclaimer
        </Anchor>{" "}
        was created for{" "}
        <Text span fw="bold" inherit>
          https://www.stickythoughts.app/
        </Text>{" "}
        by{" "}
        <Anchor href="https://policymaker.io" inherit>
          PolicyMaker.io
        </Anchor>{" "}
        on 2024-05-07.
      </Text>
    </>
  );
}
