import { useRouter } from "next/router";
import ErrorPage from "../pages/404";
import Container from "./Container";
import Header from "./Header";
import Footer from "./Footer";
import SingleColumn from "./SingleColumn";
import Section from "./Section";
import markdownStyles from "../styles/markdown.module.css";
import { decode } from "html-entities";

export default function BasicPage({ post, markdown, search }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage />;
  }
  return (
    <Container>
      <SingleColumn>
        <Header search={search} />
        <Section narrow>
          <h1>{post.title}</h1>
        </Section>
        <Section narrow className={markdownStyles["markdown"]}>
          <article
            dangerouslySetInnerHTML={{ __html: decode(markdown) }}
          ></article>
        </Section>
      </SingleColumn>
      <Footer />
    </Container>
  );
}
