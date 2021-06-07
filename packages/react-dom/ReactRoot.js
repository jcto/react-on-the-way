import * as DOMRenderer from './../react-reconciler';
import {FiberNode} from './../react-reconciler/ReactFiber';
import {createUpdate, initializeUpdateQueue, enqueueUpdate} from './../react-reconciler/ReactUpdateQueue';
import { NoPriority } from 'scheduler';
import { NoWork } from 'reactReconciler/ReactFiberExpirationTime';

/** 
 * @description 创建 FiberRoot ，其中 FiberRoot.current === RootFiber ，RootFiber.stateNode === FiberRoot
*/
export default class ReactRoot {
  constructor(container) {
    // RootFiber tag === 3
    this.current = new FiberNode(3, null, null);
    // 初始化rootFiber的updateQueue
    initializeUpdateQueue(this.current);
    // RootFiber指向FiberRoot
    this.current.stateNode = this;
    // 应用挂载的根DOM节点
    this.containerInfo = container;
    // root下已经render完毕的fiber树
    this.finishedWork = null;
    // 保存Scheduler保存的当前正在进行的异步任务 TODO 不太懂
    this.callbackNode = null;
    // 保存Scheduler保存的当前正在进行的异步任务的优先级
    this.callbackPriority = NoPriority;
    // pending 指还没有commit的任务
    // 在 scheduleUpdateOnFiber--markUpdateTimeFromFiberToRoot中会更新这个值
    // 在 commitRoot--markRootFinishedAtTime中会更新这个值
    this.firstPendingTime = NoWork;
    // 如果在Scheduler执行workLoop中某一时刻时间片用尽，则会暂停workLoop
    // 这个变量记录过期未执行的fiber的expirationTime
    this.lastExpiredTime = NoWork;
    // render阶段完成的任务的expirationTime，
    // 在 performWork完成时会被赋值
    // 在 prepareFreshStack（任务开始）、commitRoot（任务结束）会被重置
    this.finishedExpirationTime = NoWork;
  }
  render(element) {
    // root fiber 
    const current = this.current;
    const currentTime = DOMRenderer.requestCurrentTimeForUpdate();
    const expirationTime = DOMRenderer.computeExpirationForFiber(currentTime, current);
    // 空update对象
    const update = createUpdate(expirationTime);
    // fiber.tag为HostRoot类型，payload为对应要渲染的ReactComponents
    // element 为createElement创建的element树 type props:{key,ref,children}
    update.payload = {element};
    // 挂在current.updateQueue.share.pending=update
    enqueueUpdate(current, update);
    // 等待调度更新
    return DOMRenderer.scheduleUpdateOnFiber(current, expirationTime);
  }
}
