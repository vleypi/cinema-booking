import { joinClassNames } from "@luch/shared/lib";
import type { IHall } from "@/entities/hall/interfaces/hall.interface";
import { getZoneTone } from "@/entities/hall/utils/hall.util";

interface IZoneLegendProps {
  hall: IHall;
}

export const ZoneLegend = ({ hall }: IZoneLegendProps) => (
  <ul className="grid content-end gap-x-5 gap-y-2 text-[0.82rem] text-paper/64">
    {hall.priceZones.map(({ id, name }, index) => (
      <li key={id} className="inline-flex items-center gap-2">
        <i className={joinClassNames("size-2.5 rounded-[1px]", getZoneTone(index, hall.priceZones.length).swatch)} />
        {name}
      </li>
    ))}
  </ul>
);
