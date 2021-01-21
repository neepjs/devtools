/*!
 * NeepDevtools v0.1.0-alpha.9
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
import Neep from '@neep/core';

interface Options {
    value?: boolean;
    tag?: boolean;
    placeholder?: boolean;
    simple?: boolean;
    container?: boolean;
    scopeSlot?: boolean;
    slotRender?: boolean;
    deliver?: boolean;
    native?: boolean;
    group?: boolean;
    shell?: boolean;
}
interface SelectedNode {
}
declare enum Type {
    tag = "tag",
    placeholder = "placeholder",
    standard = "standard",
    simple = "simple",
    native = "native",
    container = "container",
    special = "special",
    deliver = "deliver"
}
interface VTreeNode {
    tagId: number;
    type: Type;
    tag: string;
    /** 子节点 */
    children: VTreeNode[];
    props?: {
        [key: string]: any;
    };
    /** 列表对比 key */
    key?: any;
    /** 标注 */
    labels: Neep.Label[];
    parent: number;
    value?: string;
    isNative?: boolean;
}
declare namespace Container {
    interface Props {
        options: Options;
    }
}
declare type Container = Neep.ShellComponent<Container.Props, any> | Neep.StandardComponent<Container.Props, any, any>;

declare function install(Neep: typeof Neep): void;

declare function setContainer(container?: Container): void;

declare namespace NeepDevtools {
    export { Container, Options, SelectedNode, Type, VTreeNode, install, setContainer };
}

export default NeepDevtools;
export { Container, Options, SelectedNode, Type, VTreeNode, install, setContainer };
