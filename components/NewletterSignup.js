export default function NewsletterSignup(props) {
  return (
    <form
      action="https://urbit.us11.list-manage.com/subscribe/post?u=972a03db9e0c6c25bb58de8c8&amp;amp;id=be143888d2"
      method="post"
      id="mc-embedded-subscribe-form"
      name="mc-embedded-subscribe-form"
      className="validate form max-w-screen-sm"
      target="_blank"
      novalidate
    >
      <div className="input-group" id="mc_embed_signup_scroll">
        <div className="mc-field-group w-full relative">
          <input
            className={`text-gray type-ui black border-${
              props.color || "green"
            } border-4 px-3 w-full mb-2 h-16 rounded-xl`}
            type="email"
            name="EMAIL"
            id="mce-EMAIL"
            placeholder="your@email.com"
          />
          <div className="flex h-16 items-center justify-center absolute top-0 right-6">
            <button
              id="mc-embedded-subscribe"
              className="type-ui text-gray bg-transparent"
              type="submit"
              name="subscribe"
            >
              {/* onClick={() => _paq.push(['trackEvent', 'Mailing List', 'Subscribe'])}> */}
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}