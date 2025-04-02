import ContentBox from "./content-box.component";
import LibraryBody from "./library-body.component";
import LibraryHeader from "./library-header.component";
import useUserState from "../states/user.state";

const Library = () => {
  const { authUser, isFetchingAuthUser } = useUserState();

  return (
    <ContentBox
      className={`
        flex
        flex-col
        h-full
        p-2
        gap-y-4
      `}
    >
      {/* Header */}
      <LibraryHeader authUser={authUser} />

      {/* Body */}
      <LibraryBody authUser={authUser} isLoading={isFetchingAuthUser} />
    </ContentBox>
  );
};

export default Library;
