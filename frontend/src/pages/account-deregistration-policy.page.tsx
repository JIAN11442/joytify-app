import { useIntl } from "react-intl";
import logo from "../images/logo-r.png";
import Modal from "../components/modal.component";
import Icon from "../components/react-icons.component";
import LocaleSwitcher from "../components/locale-switcher.component";
import { getAccountDeregistrationPolicyContents } from "../contents/account-deregistration-policy.content";
import useLocaleState from "../states/locale.state";

const AccountDeregistrationPolicyPage = () => {
  const intl = useIntl();
  const { deregistrationPolicyLocale, setDeregistrationPolicyLocale } = useLocaleState();
  const policyContents = getAccountDeregistrationPolicyContents(intl);

  return (
    <div className={`relative`}>
      <LocaleSwitcher
        localeState={{
          locale: deregistrationPolicyLocale,
          setLocale: setDeregistrationPolicyLocale,
        }}
        className={`
          absolute
          top-2
          right-2
          z-10
          pointer-events-auto
        `}
      />

      <Modal
        activeState={true}
        className={`
          mt-5
          w-full
          h-full
          md:px-14
          bg-neutral-100
          text-neutral-900
        `}
        tw={{ overlay: "bg-neutral-700/80" }}
      >
        {/* logo */}
        <div className={`flex justify-center`}>
          <img src={logo} alt="logo" className={`h-12 md:h-[3.2rem] object-cover`} />
        </div>

        {/* title */}
        <h1
          className={`
            my-5
            max-sm:text-[1.5rem]
            sm:text-[1.8rem]
            md:text-[2rem]
            lg:text-[2.5rem]
            font-montserrat
            font-extrabold
            text-center
          `}
        >
          {intl.formatMessage({ id: "deregistration.policy.title" })}
        </h1>

        {/* description */}
        <p
          className={`
            mt-3 
            text-sm 
            md:text-base 
            text-neutral-500/80 
            text-center
          `}
        >
          {intl.formatMessage({ id: "deregistration.policy.description" })}
        </p>

        {/* contents */}
        <div
          className={`
            flex
            flex-col
            mt-10
          `}
        >
          {policyContents.map((policy, index) => {
            const { id, icon, title, contents } = policy;

            return (
              <div key={id}>
                {/* icon and title */}
                <div
                  id={id}
                  className={`
                    flex 
                    gap-3 
                    items-center 
                    scroll-smooth
                    scroll-mt-32
                  `}
                >
                  <Icon name={icon.name} opts={{ size: icon.size }} className={`${icon.color}`} />
                  <h2
                    className={`
                      text-md
                      md:text-lg
                      font-semibold
                      text-neutral-800
                    `}
                  >
                    {title}
                  </h2>
                </div>

                {/* contents */}
                <ul
                  className={`
                    list-disc
                    pl-[57px]
                    mt-2
                    text-sm
                    md:text-base
                    text-neutral-500
                    leading-6
                  `}
                >
                  {contents.map((content, index) => {
                    return (
                      <li key={`${id}-content-${index}`} className={`mt-1 text-md text-gray-600`}>
                        {content}
                      </li>
                    );
                  })}
                </ul>

                <hr
                  className={`my-5 ${index !== policyContents.length - 1 ? "block" : "hidden"}`}
                />
              </div>
            );
          })}

          <div
            className={`
              mt-20
              text-sm
              text-neutral-500/80
              leading-6
              text-right
            `}
          >
            {intl.formatMessage(
              { id: "deregistration.policy.lastUpdatedDate" },
              { date: intl.formatDate("2025/04/23") }
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountDeregistrationPolicyPage;
