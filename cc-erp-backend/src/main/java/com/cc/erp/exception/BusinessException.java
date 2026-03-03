package com.cc.erp.exception;

import lombok.Getter;

/**
 * 业务异常
 *
 * @author CC ERP Team
 */
@Getter
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private final Integer code;

    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = 500;
    }

    /**
     * 库存不足
     */
    public static BusinessException stockNotEnough() {
        return new BusinessException(1001, "库存不足");
    }

    /**
     * 单据已审核
     */
    public static BusinessException orderAlreadyApproved() {
        return new BusinessException(1002, "单据已审核，不可修改");
    }

    /**
     * 会计期间已结账
     */
    public static BusinessException periodClosed() {
        return new BusinessException(1003, "会计期间已结账");
    }

    /**
     * 参数错误
     */
    public static BusinessException badRequest(String message) {
        return new BusinessException(400, message);
    }

    /**
     * 资源不存在
     */
    public static BusinessException notFound(String message) {
        return new BusinessException(404, message);
    }
}
