import { useParams } from "react-router-dom";
import Loader from "../components/loader.component";
import SongTableList from "../components/song-table-list.component";
import LabelHeroSection from "../components/label-hero-section.component";
import LabelActionPanel from "../components/label-action-panel.component";
import LabelRecommendationSection from "../components/label-recommendation-section.component";
import { useGetLabelByIdQuery, useGetRecommendedLabelsQuery } from "../hooks/label-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

const LabelPage = () => {
  const { id } = useParams();
  const { fm } = useScopedIntl();
  const { label } = useGetLabelByIdQuery(String(id));
  const { recommendedLabels, isLoading } = useGetRecommendedLabelsQuery(String(id));

  if (!label) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { paletee, songs } = label;

  const noSongYet = songs.length === 0;
  const hasRecommendedLabels = recommendedLabels && recommendedLabels.length > 0;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.lightVibrant} 0%,
          ${paletee?.vibrant}80 40%,
          #171717 70%
        )`,
      }}
      className={`h-full pt-10 overflow-x-hidden rounded-b-none`}
    >
      {/* hero section */}
      <LabelHeroSection fm={fm} label={label} />

      {/* content section */}
      <div
        className={`
          flex
          flex-1
          flex-col
          mt-10
          p-6
          gap-5
          w-full
          bg-gradient-to-b
          from-neutral-900/20
          to-neutral-900  
          overflow-y-auto
        `}
      >
        {/* action panel */}
        <LabelActionPanel fm={fm} label={label} />

        {/* song list */}
        <SongTableList
          fm={fm}
          songs={songs}
          paletee={paletee}
          className={`${noSongYet ? "mb-10" : "mb-32"}`}
        />

        {/* label recommendation section */}
        {hasRecommendedLabels && (
          <LabelRecommendationSection
            fm={fm}
            labels={recommendedLabels}
            isLoading={isLoading}
            className={`mb-8`}
          />
        )}
      </div>
    </div>
  );
};

export default LabelPage;
