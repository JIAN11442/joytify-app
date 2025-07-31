import { twMerge } from "tailwind-merge";
import { FormattedMessage } from "react-intl";
import AnimationWrapper from "./animation-wrapper.component";
import ManageMusicianCard from "./manage-musician-card.component";
import { GridCardListSkeleton } from "./skeleton-loading.component";
import { ScopedFormatMessage } from "../hooks/intl.hook";
import { MusicianResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { navigate } from "../lib/navigate.lib";

type ManageFollowingListProps = {
  fm: ScopedFormatMessage;
  musicians: MusicianResponse[] | undefined;
  filteredMusicians: MusicianResponse[] | undefined;
  searchQuery: string;
  isPending: boolean;
  className?: string;
};

const ManageFollowingList: React.FC<ManageFollowingListProps> = ({
  fm,
  musicians,
  filteredMusicians,
  searchQuery,
  isPending,
  className,
}) => {
  const { collapseSideBarState } = useSidebarState();

  const { isCollapsed } = collapseSideBarState;

  const hasMusicians = musicians && musicians.length > 0;
  const hasFilteredMusicians = filteredMusicians && filteredMusicians.length > 0;
  const showMusicians = hasMusicians && hasFilteredMusicians;

  const manageFollowingListPrefix = "manage.following.list";
  const manageFollowingListFm = fm(manageFollowingListPrefix);

  const handleMusicianCardOnClick = (musicianId: string) => {
    timeoutForDelay(() => {
      navigate(`/musician/${musicianId}`);
    });
  };

  if (isPending) {
    return <GridCardListSkeleton count={2} className={`mt-5`} />;
  }

  if (!showMusicians) {
    return (
      <div className={`flex h-full mt-20 justify-center`}>
        <p className={`text-center text-neutral-500`}>
          {hasMusicians ? (
            <FormattedMessage
              id={`${manageFollowingListPrefix}.noFound`}
              values={{
                searchQuery: searchQuery,
                strong: (chunks) => <strong className={`text-neutral-300`}>{chunks}</strong>,
              }}
            />
          ) : (
            manageFollowingListFm("noFollowing")
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        `
          mt-5
          mb-8
          grid
          ${
            isCollapsed
              ? "max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "max-lg:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
          }
          gap-5
      `,
        className
      )}
    >
      {filteredMusicians?.map((musician) => {
        const { _id: musicianId } = musician;
        const navigateToMusicianPage = () => handleMusicianCardOnClick(musicianId);

        return (
          <AnimationWrapper key={`manage-musician-card-${musicianId}`}>
            <ManageMusicianCard fm={fm} musician={musician} onClick={navigateToMusicianPage} />
          </AnimationWrapper>
        );
      })}
    </div>
  );
};

export default ManageFollowingList;
