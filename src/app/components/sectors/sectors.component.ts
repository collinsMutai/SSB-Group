import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LineBreakPipe } from '../line-break.pipe';

@Component({
  selector: 'app-sectors',
  standalone: true,
  imports: [CommonModule, LineBreakPipe],
  templateUrl: './sectors.component.html',
  styleUrls: ['./sectors.component.css'],
})
export class SectorsComponent {
  sectors = [
    {
      icon: 'fa fa-cogs', // You can use any icon class
      title: 'Oilfield Equipment & Spare Parts',
      description:
        'At SSB, we leverage our in-depth understanding of sourcing to enhance the analysis, negotiation, and evaluation processes for both clients and suppliers.\n\n' +
        'Our expertise spans across crafting customized spare parts management solutions for critical systems such as chemical injection skids, wellhead control panels, modular skids, emergency shutdown systems, and hydraulic power units. ' +
        'Whatever your specific requirements, our commitment is to deliver fast, reliable, and tailor-made solutions designed to meet your unique operational needs.',
    },
    {
      icon: 'fa fa-briefcase',
      title: 'Geothermal Power Plant Parts & Equipment',
      description:
        'Reliability and efficiency are paramount when it comes to geothermal power plants, and SSB is here to ensure your procurement needs are met with precision. \n\n' +
        'Our strategic sourcing minimizes downtime, boosting plant efficiency and consequently increasing megawatt output. Whether you need wear parts, core parts, or genuine OEM replacements, we can help to source for a comprehensive selection including pumps, valves, and essential spare parts to keep your operations running smoothly.',
    },
    {
      icon: 'fa fa-leaf',
      title: 'Industrial Plant parts',
      description:
        'With an extensive knowledge base and proficiency in the industrial sector, SSB prides itself on sourcing the finest equipment and spare parts from global suppliers. \n\n' +
        'Our established international connections guarantee that our clients receive products of the highest quality. Our expertise allows us to cater to a wide array of industry needs, delivering top-quality equipment and spare parts that enhance operational capability and longevity.',
    },
  ];
}
